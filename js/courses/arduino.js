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
      {
        title: "Cleaner sketches", blurb: "Variables, constants and your own functions.",
        lessons: [
          {
            id: "ar-7", title: "Variables and constants", blurb: "Name your pins and numbers.",
            intro: { text: "Instead of writing `13` everywhere, give the number a name: `const int LED_PIN = 13;`. `int` holds whole numbers, `float` holds decimals, and `bool` holds true or false. `const` means it never changes. Declare it above `setup()` so both `setup()` and `loop()` can use it.", code: "const int LED_PIN = 13;\nint waitTime = 500;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(waitTime);\n}" },
            ex: [
              Q.mc("Why write `const int LED_PIN = 13;`?", ["The name explains the number and it never changes", "It makes the LED brighter", "It runs faster", "It is required"], 0, "Names make code readable, and `const` protects the value."),
              Q.mc("Which type holds a whole number like 42?", ["int", "float", "bool", "String"], 0, "`int` is for whole numbers."),
              Q.fill("Mark the button pin as a constant.", "___ int BUTTON = 2;", ["const", "final", "static", "let"], "const", "Arduino uses `const`."),
              Q.mc("Where should a variable go so both `setup()` and `loop()` can use it?", ["Above both functions", "Inside setup()", "Inside loop()", "At the very end"], 0, "A variable declared outside every function is global."),
              Q.led("Use timing variables: make the LED stay on for 300 ms and off for 700 ms.", BLINK, { on: 500, off: 500 }, (p) => p.on === 300 && p.off === 700, "300 on plus 700 off is a 1-second cycle."),
              Q.match("Match each word to its meaning.", [["int", "a whole number"], ["float", "a number with decimals"], ["bool", "true or false"], ["const", "a value that never changes"]], "The four you'll see most."),
            ],
          },
          {
            id: "ar-8", title: "Your own functions", blurb: "Package steps and reuse them.",
            intro: { text: "You can write your own functions. `void` means the function gives nothing back. Give it a name, parentheses, and a body in curly braces, then call it by name. Functions keep `loop()` short and easy to read, and they can take parameters like `void flash(int times)`.", code: "void flash() {\n  digitalWrite(13, HIGH);\n  delay(100);\n  digitalWrite(13, LOW);\n  delay(100);\n}\n\nvoid loop() {\n  flash();\n  flash();\n  delay(1000);\n}" },
            ex: [
              Q.mc("What does `void` mean in `void flash()`?", ["The function returns nothing", "The function does nothing", "The function is empty", "It runs once"], 0, "It's a function that acts but gives no value back."),
              Q.mc("What does this loop do?", ["Blinks twice, then waits a second", "Blinks once forever", "Never blinks", "Blinks forever with no pause"], 0, "It calls `flash()` two times and then delays 1000 ms.", "void loop() {\n  flash();\n  flash();\n  delay(1000);\n}"),
              Q.fill("Start a function that takes how many times to flash.", "___ flash(int times) {", ["void", "int", "function", "def"], "void", "It returns nothing, so it's `void`."),
              Q.type("How do you call a function named flash? Type the call.", ["flash()", "flash();"], "A call is the name followed by parentheses."),
              Q.order("Order the lines to define and use a function.", ["void flash() {", "  digitalWrite(13, HIGH);", "  delay(100);", "  digitalWrite(13, LOW);", "}", "void loop() {", "  flash();", "}"], "Define the function first, then call it from loop."),
              Q.mc("Why write your own function?", ["To reuse steps and keep loop() tidy", "Arduino requires it", "To make the board faster", "To use less power"], 0, "Reusable, named steps make a sketch easier to read and change."),
            ],
          },
        ],
      },
      {
        title: "Fades and sound", blurb: "Loops that dim lights, and a buzzer that sings.",
        lessons: [
          {
            id: "ar-9", title: "Loops and fading", blurb: "Count your way to a smooth fade.",
            intro: { text: "A `for` loop repeats code a set number of times: `for (int i = 0; i <= 255; i++)` counts from 0 to 255. Put `analogWrite(9, i)` and a tiny `delay` inside to fade an LED smoothly up. Count down with `i--` to fade out.", code: "for (int i = 0; i <= 255; i++) {\n  analogWrite(9, i);\n  delay(5);\n}" },
            ex: [
              Q.mc("What does this loop do to the LED?", ["Fades it from off to full brightness", "Blinks it", "Turns it off", "Nothing"], 0, "`i` climbs from 0 to 255, so the brightness rises.", "for (int i = 0; i <= 255; i++) {\n  analogWrite(9, i);\n  delay(5);\n}"),
              Q.mc("How many times does `for (int i = 0; i < 5; i++)` run its body?", ["5", "4", "6", "Forever"], 0, "`i` takes the values 0, 1, 2, 3 and 4."),
              Q.fill("Count down so the LED fades out.", "for (int i = 255; i >= 0; i___) {\n  analogWrite(9, i);\n}", ["--", "++", "+=", "=="], "--", "`i--` lowers `i` by one each time."),
              Q.led("Make the LED stay on for three quarters of each second and off for the rest.", BLINK, { on: 500, off: 500 }, (p) => p.on === 750 && p.off === 250, "750 plus 250 is 1000 ms, and the LED is on 75% of the time."),
              Q.order("Order the lines to fade the LED up.", ["for (int i = 0; i <= 255; i++) {", "  analogWrite(9, i);", "  delay(5);", "}"], "The loop wraps the write and the pause."),
              Q.type("What is the biggest value `analogWrite` accepts?", "255", "255 means fully on."),
            ],
          },
          {
            id: "ar-10", title: "Sound with tone", blurb: "Make a buzzer play notes.",
            intro: { text: "A piezo buzzer makes sound when its pin switches quickly. `tone(8, 440)` plays 440 Hz (the note A) on pin 8 until you call `noTone(8)`. A higher frequency gives a higher pitch. `tone(8, 440, 500)` plays for 500 ms and stops by itself.", code: "void loop() {\n  tone(8, 440);\n  delay(500);\n  noTone(8);\n  delay(500);\n}" },
            ex: [
              Q.mc("What does `tone(8, 440)` do?", ["Plays 440 Hz on pin 8 until stopped", "Plays for 440 seconds", "Turns pin 440 on", "Sets the volume to 8"], 0, "It starts a steady note on pin 8."),
              Q.mc("What does a higher frequency sound like?", ["A higher pitch", "A lower pitch", "Louder", "Quieter"], 0, "More vibrations per second means a higher note."),
              Q.fill("Stop the sound on pin 8.", "___(8);", ["noTone", "stop", "mute", "tone"], "noTone", "`noTone` ends the note."),
              Q.mc("In `tone(8, 262, 250)`, what is 250?", ["How long the note plays, in milliseconds", "The pin", "The frequency", "The volume"], 0, "The optional third value is the duration."),
              Q.order("Order the lines to beep once and pause.", ["tone(8, 440);", "delay(500);", "noTone(8);", "delay(500);"], "Start the note, wait, stop it, wait."),
              Q.type("How many milliseconds is a quarter of a second?", "250", "1000 divided by 4."),
            ],
          },
        ],
      },
      {
        title: "Sensors and projects", blurb: "Read the world and build something real.",
        lessons: [
          {
            id: "ar-11", title: "Light and distance sensors", blurb: "Decide things based on what the board senses.",
            intro: { text: "A photoresistor changes with light. Wire it with a resistor to an analog pin and `analogRead` gives a number you can compare, like `if (light < 300)` for dark. An ultrasonic sensor measures distance by timing an echo. `map()` converts a reading to a range you can use.", code: "int light = analogRead(A0);\nif (light < 300) {\n  digitalWrite(13, HIGH);   // dark: lights on\n} else {\n  digitalWrite(13, LOW);\n}" },
            ex: [
              Q.fill("Read the light sensor on pin A0.", "int v = ___(A0);", ["analogRead", "digitalRead", "read", "sense"], "analogRead", "Light is a range of values, so it's an analog read."),
              Q.mc("The sensor reads about 900 in bright light and 100 in dark. Which test finds darkness?", ["light < 300", "light > 800", "light == 1023", "light == HIGH"], 0, "Dark gives small readings."),
              Q.mc("How does an ultrasonic sensor measure distance?", ["It times how long a sound echo takes to return", "It measures color", "It measures heat", "It sees the object"], 0, "Sound travels at a known speed, so time tells distance."),
              Q.mc("Why use `map()` on a sensor reading?", ["To convert it to a more useful range", "To make it louder", "To delete it", "To print it"], 0, "For example, turn 0 to 1023 into 0 to 255 for `analogWrite`."),
              Q.type("Which function reads a pin as a number from 0 to 1023?", "analogRead", "It reads a voltage and gives back 0 to 1023."),
              Q.match("Match each part to what it measures.", [["photoresistor", "light"], ["thermistor", "temperature"], ["ultrasonic sensor", "distance"], ["potentiometer", "knob position"]], "Each sensor turns the world into a number."),
            ],
          },
          {
            id: "ar-12", title: "Build a project", blurb: "Plan a small project from start to finish.",
            intro: { text: "A good project starts with a plan: what the board senses, what it decides, and what it does. Wire one thing at a time and test it before adding the next. An LED needs a resistor, often 220 ohms, in series so it doesn't burn out. If something doesn't work, check the pin number, the wiring, and the LED's direction.", code: "// traffic light: red, then green\ndigitalWrite(RED, HIGH);\ndelay(2000);\ndigitalWrite(RED, LOW);\ndigitalWrite(GREEN, HIGH);\ndelay(2000);\ndigitalWrite(GREEN, LOW);" },
            ex: [
              Q.order("Order the lines so red shows for 2 seconds, then green for 2 seconds.", ["digitalWrite(RED, HIGH);", "delay(2000);", "digitalWrite(RED, LOW);", "digitalWrite(GREEN, HIGH);", "delay(2000);", "digitalWrite(GREEN, LOW);"], "Turn a light on, wait, turn it off, then move on to the next."),
              Q.led("Make a heartbeat: on for 100 ms, then off for 900 ms.", BLINK, { on: 500, off: 500 }, (p) => p.on === 100 && p.off === 900, "A quick flash and a long pause make a heartbeat."),
              Q.mc("Your LED never lights. What should you check first?", ["The pin number, the wiring and the LED's direction", "The color of the board", "The USB cable length", "Nothing, it's broken"], 0, "Most problems are a wrong pin or a backward LED."),
              Q.type("What resistor value in ohms is commonly used with an LED? Type a number.", ["220", "330"], "A 220 or 330 ohm resistor limits the current to a safe level."),
              Q.mc("What is a good way to build a project?", ["Wire and test one piece at a time", "Wire everything, then hope", "Skip testing", "Write all the code first without running it"], 0, "Small tested steps make mistakes easy to find."),
              Q.match("Match each part to its job in a night light.", [["photoresistor", "senses the light level"], ["if statement", "decides when it is dark"], ["LED", "shows the light"], ["resistor", "protects the LED"]], "Sense, decide, act."),
            ],
          },
        ],
      },
    ],
  });
})();
