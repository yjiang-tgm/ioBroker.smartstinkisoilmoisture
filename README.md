# Smart Stinki Bodenfeuchtigkeit
## Einführung
Dieser Adapter liest JSON aus einem Arduino-Webserver aus.
In unserem Projekt ist der Arduino an einem Feuchtigkeitssensor
angeschlossen, der die Bodenfeuchtigkeit im Garten ausliest.
## Arduino Code
Der Ardunino verwendet eine C-artige Programmiersprache. Bei diesem
Programm wird die ``loop()`` Methode wiederholt aufgerufen. Hier wird
durch den HTTP-Server (WiFiNINA library) eine HTTP-Antwort mit dem
Sensorwert. Der Wert werden als Plaintext repräsentiert, nicht als
JSON oder XML.
````c
void loop() {
  // listen for incoming clients
  WiFiClient client = server.available();
  if (client) {
    Serial.println("new client");
    // an http request ends with a blank line
    boolean currentLineIsBlank = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        Serial.write(c);
        // if you've gotten to the end of the line (received a newline
        // character) and the line is blank, the http request has ended,
        // so you can send a reply
        if (c == '\n' && currentLineIsBlank) {
          // send a standard http response header
          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: text/plain; charset=utf-8");
          client.println("Connection: close");  // the connection will be closed after completion of the response
          client.println();
          client.println(analogRead(A1));
          break;
        }
        if (c == '\n') {
          // you're starting a new line
          currentLineIsBlank = true;
        } else if (c != '\r') {
          // you've gotten a character on the current line
          currentLineIsBlank = false;
        }
      }
    }
    // give the web browser time to receive the data
    delay(1);

    // close the connection:
    client.stop();
    Serial.println("client disconnected");
  }
}
````
### Adapter Funktionalität
Der Adapter ruft alle 10 Minuten (empfohlender Wert vom 
Sensorhersteller AZ-Delivery) die HTTP-Schnittstelle des Arduinos
auf. Der Wert wird in das ioBroker-Objekt __soilMoisture__ gespeichert.
Dafür muss in der Konfiguration der Webserver festgelegt sein.