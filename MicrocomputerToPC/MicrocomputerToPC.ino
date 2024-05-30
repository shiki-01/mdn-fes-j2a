#include <SoftwareSerial.h>

SoftwareSerial mySerial(10, 11); // RX, TX

int lightSensorPin = A0; // 光センサのピン
int lightSensorValue = 0; // 光センサの値
int count = 0; // カウント
char command; // PCからのコマンド

void setup() {
  Serial.begin(9600);
  mySerial.begin(9600);
  pinMode(lightSensorPin, INPUT);
}

void loop() {
  lightSensorValue = analogRead(lightSensorPin);

  if (lightSensorValue > 500) { // 光センサが反応したら
    count++;
    mySerial.println(count); // データをBluetoothで送信
    delay(1000); // 1秒待つ
  }

  if (mySerial.available()) { // PCからのコマンドをチェック
    command = mySerial.read();

    if (command == 'r') { // リセットコマンド
      count = 0;
      mySerial.println("Count reset");
    }
  }
}
