//Hen House Controller MAB Labs 2014

#include <DS3232RTC.h>
#include <TimeLord.h>
#include <Time.h>
#include <TimeAlarms.h>
#include <Wire.h>
#include <Adafruit_RGBLCDShield.h>

//Add or remove depending on relay being used
//#define MECHANICAL_RELAY

// Whether to print debug messages to Serial
const boolean SERIAL_DEBUG = true;

#ifdef MECHANICAL_RELAY              
const boolean ON = LOW,
              OFF = HIGH;
#else
const boolean ON = HIGH,
              OFF = LOW;
#endif

const byte  ERROR_PIN = 13,           // what pin we're connected to for status
            LIGHT_RELAY_PIN = A0,     // Output for Light
            HEAT_RELAY_PIN = A1,     // Output for Heat
            FAN_RELAY_PIN  = A2,     // Output for Fan
            DOOR_RELAY_PIN = A3;     // Output for Door

// Duration constants
const int FEED_DURATION_SEC = 20,
          WATER_DURATION_SEC = 20,
          DOOR_DURATION_SEC = 15;
  
const int DOOR_SHUT_AFTER_SUNSET_MIN = 30,
          DOOR_OPEN_BEFORE_SUNRISE_MIN = 30,
          LIGHT_PER_DAY_HRS = 16,
          LIGHT_ON_BEFORE_SUNSET_HRS = 1;
          
// Temperature constants  
const float MIN_REASONABLE_AIR_TEMP_F = 0.0f,  // low air temp we should never see; if we do most likely a temp probe issue
            MAX_REASONABLE_AIR_TEMP_F = 150.0f, // high air temp we should never see
            INIT_TEMP = -1000.0f,
            FAN_ON_TEMP_F = 80.0f,  // temp fan is turned on
            FAN_OFF_TEMP_F = 76.0f,  // temp fan is turned off;
            HEAT_ON_TEMP_F = 35.0f,  // temp fan is turned on
            HEAT_OFF_TEMP_F = 45.0f,  // temp fan is turned off;
            LOWEST_HEAT_F = -10.0F;

const int TIMEZONE = -6;
const float LATITUDE = 34.633889,
            LONGITUDE = -92.313889;
            
// Temperature variables
boolean airTempError = false;
float airTemp = INIT_TEMP;

//Time Variables
TimeLord coopTimeLord;

// The shield uses the I2C SCL and SDA pins.
Adafruit_RGBLCDShield lcd = Adafruit_RGBLCDShield();
String CurrentTime,
       SunRiseHr,
       SunRiseMin,
       SunSetHr,
       SunSetMin,
       DoorOpenHr,
       DoorOpenMin,
       DoorCloseHr,
       DoorCloseMin,
       LightOnHr,
       LightOnMin,
       LightOffHr,
       LightOffMin;
       
boolean LOnH,
        LOnM,
        LOffH,
        LOffM,
        SRH,
        SRM,
        SSH,
        SSM, 
        ODH,
        ODM,
        CDH,
        CDM,
        flag,
        DSTFlag;
       
long doorOnTimeSec = 0,
     lastLoopSec = now();
byte openDoorHr, openDoorMin, closeDoorHr, closeDoorMin,
     lightOnHr, lightOnMin, lightOffHr, lightOffMin;
   
void setup() {
  uint8_t hourval, minuteval;
  flag = true;
  
  if(SERIAL_DEBUG) {
     Serial.begin(9600);
  }
  
  Wire.begin();
  lcd.begin(16, 2);   // initialize display columns and rows
 
  setSyncProvider(RTC.get);
  if(SERIAL_DEBUG) {
    Serial.print("RTC Sync");
    if (timeStatus() != timeSet)
       Serial.println("RTC failed to connect");
    else 
       Serial.println("RTC connected");
  }
  
  coopTimeLord.TimeZone(TIMEZONE * 60);
  coopTimeLord.Position(LATITUDE, LONGITUDE);
  coopTimeLord.DstRules(3, 2, 11, 1, 60);
  
  setupOutputPins();
  
  initState();
  scheduleDailyAlarms();
  scheduleTodayAlarms();
  
  lcd.clear();
}

void loop() {
  uint8_t hourval, minuteval, secondval, buttons;
  char buf[20];
  
  if(SERIAL_DEBUG) {
//    serialDebugState();
  }

  updateAirTemp();
  handleError();
  handleFan();
  handleHeat();
//  handleDurations();
  
  Alarm.delay(0);
  lastLoopSec = now();
  
  buttons = lcd.readButtons();
  if (buttons) {
    flag = false;
    lcd.clear();
    lcd.setCursor(0,0);
    if (buttons & BUTTON_UP) {
      lcd.print("Sunrise");
      lcd.setCursor(0,1);
      print_hour(SunRiseHr.toInt());
      if(SRM)
        lcd.print('0');
      lcd.print(SunRiseMin);
    }
    if (buttons & BUTTON_DOWN) {
      lcd.print("Sunset");
      lcd.setCursor(0,1);
      print_hour(SunSetHr.toInt());
      if(SSM)
        lcd.print('0');
      lcd.print(SunSetMin);
    }
    if (buttons & BUTTON_LEFT) {
      lcd.print("Light Off");
      lcd.setCursor(0,1);
      print_hour(LightOffHr.toInt());
      if(LOffM)
        lcd.print('0');
      lcd.print(LightOffMin);
   
    }
    if (buttons & BUTTON_RIGHT) {
      lcd.print("Door Close");
      lcd.setCursor(0,1);
      print_hour(DoorCloseHr.toInt());
  
      if(CDM)
        lcd.print('0');
      lcd.print(DoorCloseMin);
   
    }
    if (buttons & BUTTON_SELECT) {
      flag = true;
    }
  }
  
  if(flag)
  {
    hourval = hour();
    minuteval = minute();
    secondval = second();
    lcd.setCursor(0, 0);
    lcd.print("Time: ");
    print_hour(hourval);
//    if(hourval < 10) lcd.print('0');
//    lcd.print(hourval);
//    lcd.print(':');
    if(minuteval < 10) lcd.print('0');
    lcd.print(minuteval);
    lcd.print(':');
    if(secondval < 10) lcd.print('0');
    lcd.print(secondval);
   
    lcd.setCursor(0, 1);
    lcd.print("Temp: ");
    lcd.print(airTemp);
    lcd.print("F  ");
  }
  
//  Alarm.delay(10);
}

/**
 * Updates air temp and checks for probe error.
 */
void updateAirTemp() {
  airTempError = !updateTemp(&airTemp, airTempError);
  if(airTempError || airTemp <= MIN_REASONABLE_AIR_TEMP_F || airTemp >= MAX_REASONABLE_AIR_TEMP_F){
    airTempError = true;
  }
}

/**
 * Handles any action that needs to be taken on the fan.
 */
void handleError() {
  if(airTempError)
    errorOn();
  else
    errorOff();  
}

/**
 * Handles any action that needs to be taken on the fan.
 */
void handleFan() {
 if(!airTempError){
   if(airTemp >= FAN_ON_TEMP_F){
     fanOn();
   }
  
   if(airTemp <= FAN_OFF_TEMP_F){
     fanOff();
   }
 }
}

/**
 * Handles any action that needs to be taken on the fan.
 */
void handleHeat() {
 if(!airTempError){
   if(airTemp >= HEAT_OFF_TEMP_F || airTemp <= LOWEST_HEAT_F){
     heatOff();
   }
  
   if(airTemp <= HEAT_ON_TEMP_F){
     heatOn();
   }
 }
 else {
   heatOff();
 }  
}

/**
 * Handles any durations (e.g. door, feed, water) that need to be monitored and turned off after set time.
 */
void handleDurations(){
  //Handle Door Open Close times
 if(isDoorOn()){
    doorOnTimeSec += now() - lastLoopSec;
//    if(SERIAL_DEBUG){
//        Serial.print("Door (");
//        Serial.print(doorOnTimeSec);
//        Serial.println(" sec)");
//    }
    if(doorOnTimeSec >= DOOR_DURATION_SEC){
      doorOff();
    }
  }
}

/**
 * Calculates alarm times used for scheduling and init state.
 */
void calculateAlarmTimes(){
  
  LOnH = false;
  LOnM = false;
  LOffH = false;
  LOffM = false;
  SRH = false;
  SRM = false;
  SSH = false;
  SSM = false;
  ODH = false;
  ODM = false;
  CDH = false;
  CDM = false;
  
  int nowHour = hour(),
   nowMinute = minute(),
   nowDay = day(),
   nowMonth = month(),
   nowYear = year();
   
  if(SERIAL_DEBUG){
    Serial.print("nowHour: ");
    Serial.println(nowHour);
    Serial.print("nowMinute: ");
    Serial.println(nowMinute);  
    Serial.print("nowDay: ");
    Serial.println(nowDay);
    Serial.print("nowMonth: ");
    Serial.println(nowMonth);
    Serial.print("nowYear: ");
    Serial.println(nowYear);
  }
  
  byte timeLordSunRise[]  = {0, 0, 0, nowDay, nowMonth, nowYear};
  byte timeLordSunSet[]  = {0, 0, 0, nowDay, nowMonth, nowYear};

  coopTimeLord.SunRise(timeLordSunRise);
  coopTimeLord.SunSet(timeLordSunSet);

  DSTFlag = InDst(timeLordSunRise);  
//  if(InDst(timeLordSunRise))
//    DSTFlag = true;
//  else
//    DSTFlag = false;
    
  if(SERIAL_DEBUG){
    Serial.print("sunrise: ");
    Serial.print(timeLordSunRise[2]);
    Serial.print(":");
    Serial.println(timeLordSunRise[1]);
    Serial.print("sunset: ");
    Serial.print(timeLordSunSet[2]);
    Serial.print(":");
    Serial.println(timeLordSunSet[1]);
  }
  
  openDoorHr = timeLordSunRise[2];
  openDoorMin = timeLordSunRise[1];
  closeDoorHr = timeLordSunSet[2];
  closeDoorMin = timeLordSunSet[1];

  if(openDoorHr < 10) 
    SRH = true;
  SunRiseHr = String(openDoorHr);
  
  if(openDoorMin < 10) 
    SRM = true;
  SunRiseMin = String(openDoorMin);
  
  if(closeDoorHr < 10) 
    SSH = true;
  SunSetHr = String(closeDoorHr);
  
  if(closeDoorMin < 10) 
    SSM = true;
  SunSetMin = String(closeDoorMin);
  
  if(closeDoorMin + DOOR_SHUT_AFTER_SUNSET_MIN >= 60){
    closeDoorHr += (closeDoorMin + DOOR_SHUT_AFTER_SUNSET_MIN) / 60;
    closeDoorMin = (closeDoorMin + DOOR_SHUT_AFTER_SUNSET_MIN) % 60;
  }else{
    closeDoorMin += DOOR_SHUT_AFTER_SUNSET_MIN;
  }
  
  if(openDoorMin - DOOR_OPEN_BEFORE_SUNRISE_MIN < 0){
    openDoorHr -= 1;
    openDoorMin = 60 + (openDoorMin - DOOR_OPEN_BEFORE_SUNRISE_MIN);
  }else{
    openDoorMin -= DOOR_SHUT_AFTER_SUNSET_MIN;
  }

  if(openDoorHr < 10) 
    ODH = true;
  DoorOpenHr = String(openDoorHr);
  
  if(openDoorMin < 10) 
    ODM = true;
  DoorOpenMin = String(openDoorMin);
  
  if(closeDoorHr < 10) 
    CDH = true;
  DoorCloseHr = String(closeDoorHr);
  
  if(closeDoorMin < 10) 
    CDM = true;
  DoorCloseMin = String(closeDoorMin);
  
  if(SERIAL_DEBUG){
    Serial.print("open door: ");
    Serial.print(openDoorHr);
    Serial.print(":");
    Serial.println(openDoorMin);
    Serial.print("close door: ");
    Serial.print(closeDoorHr);
    Serial.print(":");
    Serial.println(closeDoorMin);
  }

  float naturalDaylightHr;
  naturalDaylightHr = 12.0f-(timeLordSunRise[2] + timeLordSunRise[1]/60.0f);
  naturalDaylightHr += (timeLordSunSet[2] + timeLordSunSet[1]/60.0f)-12.0f;
  
  if(SERIAL_DEBUG){
    Serial.print("natural daylight (hrs): ");
    Serial.println(naturalDaylightHr);
  }
  
  lightOnHr = timeLordSunSet[2];
  lightOnMin = timeLordSunSet[1];
  lightOffHr = timeLordSunSet[2];
  lightOffMin = timeLordSunSet[1];
  
  float lightNeededHrs = LIGHT_PER_DAY_HRS - naturalDaylightHr;
  int lightNeededMins = lightNeededHrs * 60;
  
  Serial.print("light needed (mins): ");
  Serial.println(lightNeededMins);

  lightOnHr -= LIGHT_ON_BEFORE_SUNSET_HRS;

  if(lightOffMin + lightNeededMins >= 60){
    lightOffHr += (lightOffMin + lightNeededMins) / 60;
    lightOffMin = (lightOffMin + lightNeededMins) % 60;
  }else{
    lightOffMin += lightNeededMins;
  }
  
  if(lightOnHr < 10) 
    LOnH = true;
  LightOnHr = String(lightOnHr);
    
  if(lightOnMin < 10) 
    LOnM = true;
  LightOnMin = String(lightOnMin);
    
  if(lightOffHr < 10) 
    LOffH = true;
  LightOffHr = String(lightOffHr);
    
  if(lightOffMin < 10) 
    LOffM = true;
  LightOffMin = String(lightOffMin);
  
  if(SERIAL_DEBUG){
    Serial.print("light on: ");
    Serial.print(lightOnHr);
    Serial.print(":");
    Serial.println(lightOnMin);
    Serial.print("light off: ");
    Serial.print(lightOffHr);
    Serial.print(":");
    Serial.println(lightOffMin);
    Serial.print("LCD Sunrise: ");
    Serial.print(SunRiseHr);
    Serial.print(":");
    Serial.println(SunRiseMin);
    Serial.print("LCD Sunset: ");
    Serial.print(SunSetHr);
    Serial.print(":");
    Serial.println(SunSetMin);
    Serial.print("Door Open: ");
    Serial.print(DoorOpenHr);
    Serial.print(":");
    Serial.println(DoorOpenMin);
    Serial.print("Door Close: ");
    Serial.print(DoorCloseHr);
    Serial.print(":");
    Serial.println(DoorCloseMin);
    Serial.print("Light On: ");
    Serial.print(LightOnHr);
    Serial.print(":");
    Serial.println(LightOnMin);
    Serial.print("Light Off: ");
    Serial.print(LightOffHr);
    Serial.print(":");
    Serial.println(LightOffMin);
  }
}

/**
 * Schedule daily alarms.
 */
void scheduleDailyAlarms(){
  Alarm.alarmRepeat(1, 0, 0, scheduleTodayAlarms);
}

/**
 * Schedule today alarms.
 */
void scheduleTodayAlarms(){
  calculateAlarmTimes();
  
  int nowHr = hourMinuteToHour(hour(), minute());
  
  if(nowHr < hourMinuteToHour(openDoorHr, openDoorMin)){
    Alarm.alarmOnce(openDoorHr, openDoorMin, 0, door);
    Alarm.alarmOnce(openDoorHr, openDoorMin, DOOR_DURATION_SEC, doorOff);
  } 
  
  if(nowHr < hourMinuteToHour(closeDoorHr, closeDoorMin)){
    Alarm.alarmOnce(closeDoorHr, closeDoorMin, 0, door);
    Alarm.alarmOnce(closeDoorHr, closeDoorMin, DOOR_DURATION_SEC, doorOff);
  } 

  if(nowHr < hourMinuteToHour(lightOnHr, lightOnMin)){
    Alarm.alarmOnce(lightOnHr, lightOnMin, 0, lightOn); 
  }
  
  if(nowHr < hourMinuteToHour(lightOffHr, lightOffMin)){
    Alarm.alarmOnce(lightOffHr, lightOffMin, 0, lightOff);
  }
}

/**
 * Initialize state based on current time 
 */
void initState(){
  fanOff();
  heatOff();
  
  calculateAlarmTimes();
  
  int nowHr = hourMinuteToHour(hour(), minute());

  if(nowHr > hourMinuteToHour(lightOnHr, lightOnMin) && nowHr < hourMinuteToHour(lightOffHr, lightOffMin)){
    Serial.println("light init on");
    lightOn();
  }else{
    Serial.println("light init off");
    lightOff();
  }
  
//  if(nowHr > hourMinuteToHour(openDoorHr, openDoorMin) && nowHr < hourMinuteToHour(closeDoorHr, closeDoorMin)){
//    Serial.println("door init open");
//    enableDoorOpening();
//  }else{
//    Serial.println("door init close");
//    enableDoorClosing();
//  }  
}
 
/**
 * Set pin modes
 */
void setupOutputPins(){
  // relays
  pinMode(ERROR_PIN, OUTPUT);
  digitalWrite(ERROR_PIN, OFF);
  pinMode(LIGHT_RELAY_PIN, OUTPUT);
  digitalWrite(LIGHT_RELAY_PIN, OFF);
  pinMode(HEAT_RELAY_PIN, OUTPUT);
  digitalWrite(HEAT_RELAY_PIN, OFF);
  pinMode(FAN_RELAY_PIN, OUTPUT);
  digitalWrite(FAN_RELAY_PIN, OFF);
  pinMode(DOOR_RELAY_PIN, OUTPUT);
  digitalWrite(DOOR_RELAY_PIN, OFF);
}
    
void serialDebugState(){    
//  Serial.print("LIGHT_TOGGLE_BUTTON_PIN (");
//  Serial.print(LIGHT_TOGGLE_BUTTON_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(digitalRead(LIGHT_TOGGLE_BUTTON_PIN));
//  Serial.print(", WATER_BUTTON_PIN (");
//  Serial.print(WATER_BUTTON_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(digitalRead(WATER_BUTTON_PIN));
//  Serial.print(", DOOR_OPEN_SWITCH_PIN (");
//  Serial.print(DOOR_OPEN_SWITCH_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(digitalRead(DOOR_OPEN_SWITCH_PIN));
//  Serial.print(", DOOR_CLOSE_SWITCH_PIN (");
//  Serial.print(DOOR_CLOSE_SWITCH_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(digitalRead(DOOR_CLOSE_SWITCH_PIN));
//  Serial.print(", WATER_FLOAT_SWITCH_PIN (");
//  Serial.print(WATER_FLOAT_SWITCH_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(digitalRead(WATER_FLOAT_SWITCH_PIN));
//  Serial.print(", FEED_BUTTON_PIN (");
//  Serial.print(FEED_BUTTON_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(digitalRead(FEED_BUTTON_PIN));
//  Serial.print(", DOOR_CLOSE_STOP_PIN (");
//  Serial.print(DOOR_CLOSE_STOP_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(analogRead(DOOR_CLOSE_STOP_PIN) > 500);
//  Serial.print(", DOOR_OPEN_STOP_PIN (");
//  Serial.print(DOOR_OPEN_STOP_PIN, DEC);
//  Serial.print("): ");
//  Serial.print(analogRead(DOOR_OPEN_STOP_PIN) > 500);
//  Serial.println();
  
  Serial.print("airTemp: ");
  if(!airTempError){
    Serial.print(airTemp);
    Serial.println();
  }else{
    Serial.println("ERROR");
  }
  
  Serial.print("time: ");
  Serial.print(year(), DEC);
  Serial.print('/');
  Serial.print(month(), DEC);
  Serial.print('/');
  Serial.print(day(), DEC);
  Serial.print(' ');
  Serial.print(hour(), DEC);
  Serial.print(':');
  Serial.print(minute(), DEC);
  Serial.print(':');
  Serial.print(second(), DEC);
  Serial.println();
}

// error methods
void toggleError(){
  if(isErrorOn()){
    errorOff();  
  }else{
    errorOn();
  }
}

boolean isErrorOn(){
  return digitalRead(ERROR_PIN) == HIGH;
}

void errorOn(){
  digitalWrite(ERROR_PIN, HIGH);
}

void errorOff(){
  digitalWrite(ERROR_PIN, LOW);
}
// end error methods

// light methods
void toggleLight(){
  if(isLightOn()){
    lightOff();  
  }else{
    lightOn();
  }
}

boolean isLightOn(){
  return digitalRead(LIGHT_RELAY_PIN) == ON;
}

void lightOn(){
  digitalWrite(LIGHT_RELAY_PIN, ON);
}

void lightOff(){
  digitalWrite(LIGHT_RELAY_PIN, OFF);
}

boolean isLightToggleButton(){
//  return digitalRead(LIGHT_TOGGLE_BUTTON_PIN) == HIGH;
}
// end light methods

// heat methods
void toggleHeat(){
  if(isHeatOn()){
    heatOff();  
  }else{
    heatOn();
  }
}

boolean isHeatOn(){
  return digitalRead(HEAT_RELAY_PIN) == ON;
}

void heatOn(){
  digitalWrite(HEAT_RELAY_PIN, ON);
}

void heatOff(){
  digitalWrite(HEAT_RELAY_PIN, OFF);
}
// end heat methods

// fan methods
void toggleFan(){
  if(isFanOn()){
    fanOff();  
  }else{
    fanOn();
  }
}

boolean isFanOn(){
  return digitalRead(FAN_RELAY_PIN) == ON;
}

void fanOn(){
  digitalWrite(FAN_RELAY_PIN, ON);
}

void fanOff(){
  digitalWrite(FAN_RELAY_PIN, OFF);
}
// end fan methods

// door methods
void toggleDoor(){
  if(isDoorOn()){
    doorOff();  
  }else{
    doorOn();
  }
}

boolean isDoorOn(){
  return digitalRead(DOOR_RELAY_PIN) == ON;
}

void door() {
  doorOnTimeSec = 0;
  doorOn();
}

void doorOn(){
  digitalWrite(DOOR_RELAY_PIN, ON);
}

void doorOff(){
  digitalWrite(DOOR_RELAY_PIN, OFF);
}
// end door methods


/**
 * Updates a single temp
 */
boolean updateTemp(float * fltTemp, boolean previousError){
  float temp = -1;
  
  if(previousError){
    Alarm.delay(300);
  }
  
  temp = RTC.temperature();
  if(temp == -1000)
    return false;
    
  *fltTemp = convertCeliusToFahrenheit(temp / 4.0);
  return true;
}

/**
 * Converts celsius to fahrenheit
 */ 
float convertCeliusToFahrenheit(float c) {
  return((c*1.8)+32); 
}

/**
 * Converts fahrenheit to celsius
 */ 
float convertFahrenheitToCelius(float f) {
  return((f-32)*0.555555556); 
}

float hourMinuteToHour(int hour, int minute){
  return hour + minute/60.0f;
}

//Calculate DST
bool InDst(uint8_t * p){
	// input is assumed to be standard time
	char nSundays, prevSunday, weekday;
        int dstm1 = 3,
            dstw1 = 2,
            dstm2 = 11,
            dstw2 = 1;
            
	if(p[tl_month]<dstm1 || p[tl_month]>dstm2) return false;
	if(p[tl_month]>dstm1 && p[tl_month]<dstm2) return true;
	
	// if we get here, we are in either the start or end month
	
	// How many sundays so far this month?
	weekday=DayOfWeek(p);
	nSundays=0;
	prevSunday=p[tl_day]-weekday+1;
	if(prevSunday>0){ 
		nSundays=prevSunday/7;
		nSundays++;
	}
	
	if(p[tl_month]==dstm1){
		if(nSundays<dstw1) return false;
		if(nSundays>dstw1) return true;
		if(weekday>1) return true;
		if(p[tl_hour]>1) return true;
		return false;
	}
	
	if(nSundays<dstw2) return true;
	if(nSundays>dstw2) return false;
	if(weekday>1) return false;
	if(p[tl_hour]>1) return false;
	return true;
}

uint8_t DayOfWeek(uint8_t * when){
	int year;
	uint8_t  month,day;

	year=when[tl_year]+2000;
	month=when[tl_month];
	day=when[tl_day];
	
	if (month < 3) {
      month += 12;
      year--;
   }
   day= ((13*month+3)/5 + day + year + year/4 - year/100 + year/400 ) % 7;
   day=(day+1) % 7;
   return day+1;
}

// Print hour modified for DST and 12 hour clock
void print_hour(uint8_t hourval) {
  
  if(DSTFlag)
    hourval += 1;
  
  if(hourval > 24)
    hourval -= 24;
  
  if(hourval > 12)
    hourval -= 12;
    
  if(hourval < 10) lcd.print('0');
  lcd.print(hourval);
  lcd.print(':');
}  


