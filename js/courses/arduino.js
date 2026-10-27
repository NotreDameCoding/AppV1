(function () {
  const Q = NDC.Q;
  const BLINK = "void loop() {\n  digitalWrite(13, HIGH);\n  delay({{on}});\n  digitalWrite(13, LOW);\n  delay({{off}});\n}";
  NDC.courses.push({
    id: "ar", name: "Arduino", lang: "ar", hex: "#2ee6c2", color: "var(--c-ar)", glyph: "Ar",
    tagline: "Code that touches the real world. Lights, buttons and sensors.",
    runnable: false,
    units: [
      {
        title: "Meet the board", blurb: "What a sketch is and how it runs.",
        lessons: [
          {
            id: "ar-1", title: "Setup and loop", blurb: "The two functions every sketch has.",
            intro: { text: "An Arduino program is called a sketch. `setup()` runs once when the board powers on. `loop()` then runs over and over, forever. You upload the sketch to the board over USB, and the board runs it on its own.", code: "void setup() {\n  // runs once\n}\n\nvoid loop() {\n  // runs forever\n}" },
            ex: [
              Q.mc("How often does `setup()` run?", ["Once, at the start", "Forever", "Every second", "Only when a button is pressed"], 0, "Use it for one-time preparation."),
              Q.mc("How often does `loop()` run?", ["Over and over, forever", "Once", "Twice", "Until the sketch is saved"], 0, "As soon as it finishes, it starts again."),
              Q.match("Match each word to its meaning.", [["sketch", "an Arduino program"], ["setup()", "runs once"], ["loop()", "runs forever"], ["upload", "send the sketch to the board"]], "The vocabulary you'll hear all the time."),
              Q.order("Put the lines in order to build an empty sketch.", ["void setup() {", "  // run once", "}", "void loop() {", "  // run forever", "}"], "`setup` comes first, then `loop`."),
              Q.mc("Where does the sketch actually run?", ["On the board's microcontroller chip", "On your computer", "In the cloud", "In the USB cable"], 0, "Your computer only compiles and uploads it."),
              Q.type("Which function repeats forever?", "loop", "`loop()` is the heartbeat of every sketch.", "void ___() { ... }"),
            ],
          },
          {
            id: "ar-2", title: "Blink an LED", blurb: "The hello world of hardware.",
            intro: { text: "`pinMode(13, OUTPUT)` tells the board a pin sends power out. `digitalWrite(13, HIGH)` turns it on, `LOW` turns it off. `delay(1000)` waits 1000 milliseconds, which is one second.", code: "void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}" },
            ex: [
              Q.fill("Set pin 13 up to send power out.", "pinMode(13, ___);", ["OUTPUT", "INPUT", "HIGH", "ON"], "OUTPUT", "An output pin drives things like LEDs."),
              Q.fill("Turn the LED on.", "digitalWrite(13, ___);", ["HIGH", "LOW", "ON", "1000"], "HIGH", "`HIGH` is on, `LOW` is off."),
              Q.mc("How many milliseconds are in 2 seconds?", ["2000", "200", "20", "2"], 0, "1000 ms = 1 second."),
              Q.led("Make the LED stay on for half a second and off for half a second.", BLINK, { on: 1000, off: 1000 }, (p) => p.on === 500 && p.off === 500, "500 ms on plus 500 ms off is one blink per second."),
              Q.order("Order the lines so the LED blinks once.", ["digitalWrite(13, HIGH);", "delay(500);", "digitalWrite(13, LOW);", "delay(500);"], "On, wait, off, wait."),
              Q.led("Make it blink fast: 4 blinks every second.", BLINK, { on: 500, off: 500 }, (p) => p.on + p.off === 250, "One blink takes 250 ms, so 125 ms on and 125 ms off adds up."),
            ],
          },
        ],
      },
      {
        title: "Reading the world", blurb: "Buttons and sensors.",
        lessons: [
          {
            id: "ar-3", title: "Buttons", blurb: "Read digital input.",
            intro: { text: "`digitalRead(pin)` returns `HIGH` or `LOW`. With `INPUT_PULLUP`, a button wired to ground reads `HIGH` normally and `LOW` while it's pressed. It sounds backwards, but it saves you from adding a resistor.", code: "pinMode(2, INPUT_PULLUP);\nif (digitalRead(2) == LOW) {\n  // button is pressed\n}" },
            ex: [
              Q.mc("What does `digitalRead` give back?", ["HIGH or LOW", "A number from 0 to 1023", "Text", "Nothing"], 0, "It reads a pin that is either on or off."),
              Q.fill("Set up a button on pin 2 with the built-in resistor.", "pinMode(2, ___);", ["INPUT_PULLUP", "OUTPUT", "PULLDOWN", "BUTTON"], "INPUT_PULLUP", "The pullup keeps the pin steady when the button isn't pressed."),
              Q.mc("With `INPUT_PULLUP`, what does the pin read while the button is pressed?", ["LOW", "HIGH", "0 to 1023", "Nothing"], 0, "Pressing connects the pin to ground."),
              Q.mc("The button is held down with INPUT_PULLUP. What does the LED do?", ["Turns on", "Turns off", "Blinks", "Nothing"], 0, "The pin reads LOW, so the `if` runs.", "if (digitalRead(2) == LOW) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}"),
              Q.order("Put these loop lines in order so the LED follows the button.", ["void loop() {", "  if (digitalRead(2) == LOW) {", "    digitalWrite(13, HIGH);", "  } else {", "    digitalWrite(13, LOW);", "  }", "}"], "Read the button, then choose what to do."),
              Q.match("Match each word to its meaning.", [["INPUT", "a pin that reads"], ["OUTPUT", "a pin that sends power"], ["HIGH", "on, about 5 volts"], ["LOW", "off, 0 volts"]], "The four words behind every pin."),
            ],
          },
          {
            id: "ar-4", title: "Analog and PWM", blurb: "Values between on and off.",
            intro: { text: "`analogRead(pin)` measures a voltage and returns 0 to 1023. `analogWrite(pin, value)` takes 0 to 255 and fakes a dimmer using PWM (pulse width modulation), but only on pins marked with a `~`. `map()` converts one range to another.", code: "int light = analogRead(A0);       // 0 to 1023\nint level = map(light, 0, 1023, 0, 255);\nanalogWrite(9, level);" },
            ex: [
              Q.mc("What range does `analogRead` return?", ["0 to 1023", "0 to 255", "0 to 100", "-1 to 1"], 0, "The Uno family measures with 10 bits by default."),
              Q.mc("What range does `analogWrite` take?", ["0 to 255", "0 to 1023", "0 to 100", "HIGH or LOW"], 0, "0 is off and 255 is fully on."),
              Q.mc("About what does this print?", ["127", "255", "512", "1023"], 0, "512 is about half of 1023, so the result is about half of 255.", "Serial.println(map(512, 0, 1023, 0, 255));"),
              Q.fill("Set an LED on pin 9 to about half brightness.", "analogWrite(9, ___);", ["127", "1023", "512", "5"], "127", "Half of 255 is about 127."),
              Q.mc("Which pins can do PWM on an Uno?", ["The ones marked with a ~", "Only pin 13", "Pins A0 to A5", "All of them"], 0, "Look for the tilde on the board."),
              Q.type("Which function reads a sensor like a photoresistor?", "analogRead", "Light sensors give a range of values, not just on and off."),
            ],
          },
        ],
      },
      {
        title: "Logic and talking", blurb: "Print to the computer, combine ideas.",
        lessons: [
          {
            id: "ar-5", title: "The Serial Monitor", blurb: "See what the board is thinking.",
            intro: { text: "`Serial.begin(9600)` in `setup()` opens a line to your computer. `Serial.println(x)` sends a value there, and you read it in the Serial Monitor. Both sides have to use the same speed (baud rate).", code: "void setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  Serial.println(analogRead(A0));\n  delay(200);\n}" },
            ex: [
              Q.fill("Open the serial connection at 9600.", "Serial.begin(___);", ["9600", "13", "1023", "HIGH"], "9600", "9600 is the usual speed."),
              Q.mc("Where does `Serial.println` show its output?", ["The Serial Monitor on your computer", "An LED", "The board's screen", "A text file on the board"], 0, "It travels over the USB cable."),
              Q.order("Order the lines so the sketch prints a sensor value.", ["void setup() {", "  Serial.begin(9600);", "}", "void loop() {", "  Serial.println(analogRead(A0));", "}"], "Begin in setup, print in loop."),
              Q.mc("What does this print?", ["6", "3", "x * 2", "9"], 0, "x is 3, so x * 2 is 6.", "int x = 3;\nSerial.println(x * 2);"),
              Q.mc("Why must the Serial Monitor's baud rate match `Serial.begin`?", ["Both sides need to talk at the same speed to understand each other", "It makes the LED brighter", "It saves memory", "It doesn't matter"], 0, "A mismatch shows up as garbled text."),
              Q.type("Which call prints a value and then starts a new line?", ["Serial.println", "println"], "`print` stays on the same line, and `println` moves to the next.", "Serial.___(value);"),
            ],
          },
          {
            id: "ar-6", title: "Put it together", blurb: "Circuits and logic as one idea.",
            intro: { text: "An LED needs a resistor in series, or it can burn out from too much current. A light sensor (photoresistor) plus an `if` makes a night light. `delay()` pauses everything, while `millis()` lets you track time without stopping the rest of the sketch.", code: "void loop() {\n  int light = analogRead(A0);\n  if (light < 300) {\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(13, LOW);\n  }\n}" },
            ex: [
              Q.mc("Why does an LED need a resistor?", ["To limit the current so it doesn't burn out", "To make it blink", "To store the sketch", "To read a button"], 0, "Without one, too much current flows through the LED."),
              Q.mc("The room is dark and `analogRead` gives 120. What does the LED do?", ["Turns on", "Turns off", "Blinks", "Nothing"], 0, "120 is less than 300, so the `if` runs.", "int light = analogRead(A0);\nif (light < 300) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}"),
              Q.mc("What is the downside of `delay()`?", ["The board does nothing else while it waits", "It makes the LED dimmer", "It only works once", "It uses a lot of power"], 0, "While waiting, buttons and sensors are ignored. `millis()` avoids this."),
              Q.order("Order the loop lines to build a night light.", ["void loop() {", "  int light = analogRead(A0);", "  if (light < 300) {", "    digitalWrite(13, HIGH);", "  } else {", "    digitalWrite(13, LOW);", "  }", "}"], "Read the sensor, compare, then switch the LED."),
              Q.led("Make the LED blink once every 2 seconds (on for 1 second, off for 1 second).", BLINK, { on: 200, off: 200 }, (p) => p.on === 1000 && p.off === 1000, "That's a 2-second cycle."),
              Q.match("Match each part to its job.", [["LED", "gives off light"], ["resistor", "limits current"], ["photoresistor", "senses light"], ["button", "a digital input"]], "A circuit is a team of parts."),
            ],
          },
        ],
      },
    ],
  });
})();
