/* Extra teaching cards: HTML 7-12, Python, Java, Arduino. */
Object.assign(NDC.more, {
  "ht-7": [
    { head: "Data in rows and columns", text: "A table shows data in a grid. You build it row by row. `<table>` wraps it all. Each row is a `<tr>`. Inside a row, `<th>` is a header cell (bold, usually the first row) and `<td>` is a normal data cell.", code: "<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>Ana</td><td>10</td></tr>\n  <tr><td>Bo</td><td>7</td></tr>\n</table>", after: "Every row should have the same number of cells. Use tables for data like schedules and scores, not for page layout." },
  ],
  "ht-8": [
    { head: "Video and audio", text: "`<video>` and `<audio>` embed media. Point to the file with `src`. Add the `controls` attribute to show play, pause and volume buttons. Without it the player is invisible. Some attributes, like `controls`, have no value. Their presence is enough.", code: "<video src=\"clip.mp4\" controls></video>\n<audio src=\"song.mp3\" controls></audio>", after: "Wrap media in `<figure>` and add `<figcaption>` to give it a caption." },
    { head: "Captions and alt text", text: "A `<figure>` groups a picture or video with its caption, `<figcaption>`. Every `<img>` still needs `alt` text, which describes the image for people who can't see it.", code: "<figure>\n  <img src=\"team.jpg\" alt=\"The club at a meeting\">\n  <figcaption>Our first meeting</figcaption>\n</figure>", after: "Alt text should say what the image shows, not just \"image\"." },
  ],
  "ht-9": [
    { head: "Tags that describe themselves", text: "A page made only of `<div>`s works, but it tells software nothing. Semantic tags say what each part is. `<header>` is the top, `<nav>` holds the main links, `<main>` is the unique content, `<article>` is a self-contained piece, `<aside>` is a side note, `<footer>` is the bottom.", code: "<header><h1>My Site</h1></header>\n<nav><a href=\"#\">Home</a> <a href=\"#\">About</a></nav>\n<main>\n  <article><h2>News</h2><p>...</p></article>\n</main>\n<footer>NDHS</footer>", after: "Screen readers let people jump straight to `<main>` or `<nav>` thanks to these tags." },
  ],
  "ht-10": [
    { head: "Labels and inputs", text: "Every input needs a `<label>`. Give the input an `id`, and set the label's `for` to the same value. Then clicking the label selects the input, and screen readers announce it correctly.", code: "<label for=\"email\">Email</label>\n<input type=\"email\" id=\"email\">", after: "The `type` changes behavior: `email` checks for an @, `password` hides characters, `number` allows only digits." },
    { head: "Choices", text: "`<select>` makes a drop-down list. Each choice is an `<option>`. `<input type=\"checkbox\">` makes a tick box. A button with `type=\"submit\"` sends the form.", code: "<select>\n  <option>Python</option>\n  <option>CSS</option>\n</select>\n<input type=\"checkbox\" id=\"ok\">\n<label for=\"ok\">Remember me</label>", after: "Put a checkbox's label next to it, and connect them with `for` and `id` too." },
  ],
  "ht-11": [
    { head: "Linking within a page", text: "A link to `#about` jumps to the element with `id=\"about\"`. This is how long pages have a menu at the top that scrolls to sections. The `href` and the `id` must match, apart from the `#` in the link.", code: "<a href=\"#contact\">Contact</a>\n...\n<section id=\"contact\">\n  <h2>Contact</h2>\n</section>", after: "Ids must be unique on a page, and should not contain spaces." },
    { head: "Email links and new tabs", text: "`mailto:` links open the person's email program. `target=\"_blank\"` opens a link in a new tab. When you do that, also add `rel=\"noopener\"` so the new page can't control yours.", code: "<a href=\"mailto:hi@school.org\">Email us</a>\n<a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">Visit</a>", after: "The `<meta name=\"viewport\">` tag in the head makes the page fit phone screens." },
  ],
  "ht-12": [
    { head: "Plan before you build", text: "Sketch the page on paper first. What sections does it have? A profile page might have a name, a short intro, a list of hobbies, and a link. Then choose the tag for each: `h1`, `p`, `ul` with `li` items, and `a`.", code: "<h1>Ada Lovelace</h1>\n<p>I like math and machines.</p>\n<h2>Hobbies</h2>\n<ul>\n  <li>Chess</li>\n  <li>Code</li>\n</ul>\n<a href=\"https://example.com\">My site</a>", after: "Build in small steps and check the preview after each one." },
    { head: "Check your work", text: "When something doesn't show up, check three things: Is every tag closed? Are the tags nested in the right order? Is the thing in the right place (visible content in the body)? A card is a good pattern: a `<section>` holding an `<img>` with alt text, a heading and a paragraph.", code: "<section>\n  <img src=\"dragon.png\" alt=\"A dragon\">\n  <h2>Dragon</h2>\n  <p>Breathes fire.</p>\n</section>", after: "The checks in the exercise tell you exactly which requirement is missing." },
  ],

  "py-1": [
    { head: "Running code", text: "Python runs your code line by line from the top. To show something, use `print()`. Anything in quotes is **text** (a string), and Python prints it exactly. Without quotes, Python thinks it's a name or command.", code: "print(\"Hello\")\nprint(2 + 3)", after: "This shows `Hello` and then `5`. Python does the math before printing." },
    { head: "Common mistakes", text: "`print` must be lowercase. Parentheses and quotes always come in pairs. And a `#` starts a **comment**, which is a note for people that Python ignores.", code: "# this line is ignored\nprint(\"Hi\")  # this too\n\nPrint(\"Hi\")   # wrong: capital P", after: "Read the error message: it names the line number and the problem." },
  ],
  "py-2": [
    { head: "Variables", text: "A **variable** is a name for a value. Store it with `=`. You can use the name later instead of retyping the value, and you can change it by assigning again.", code: "name = \"Ada\"\nage = 15\nage = age + 1\nprint(age)", after: "This prints `16`. In Python `=` means store, and `==` means compare." },
    { head: "Types and f-strings", text: "Values have types: text like `\"Ada\"` (string), whole numbers like `15` (int), decimals like `3.14` (float). An **f-string** puts variables into text: write `f` before the quotes and put names in curly braces.", code: "name = \"Ada\"\nprint(f\"Hi {name}!\")", after: "This prints `Hi Ada!`. Note that `\"42\"` in quotes is text, not a number." },
  ],
  "py-3": [
    { head: "Making choices", text: "`if` runs a block only when its condition is true. The block is **indented** (4 spaces) and the `if` line ends with a colon. Add `else` for what to do otherwise, and `elif` for extra tests in between.", code: "age = 16\nif age >= 18:\n    print(\"adult\")\nelif age >= 13:\n    print(\"teen\")\nelse:\n    print(\"child\")", after: "Python checks from the top and runs the first block that's true. This prints `teen`." },
    { head: "Comparing and combining", text: "`==` checks equal, `!=` not equal, and `>`, `<`, `>=`, `<=` compare sizes. Combine tests with `and`, `or` and `not`. Mistake to avoid: using one `=` in a condition.", code: "if age >= 13 and age < 20:\n    print(\"teen\")", after: "Indentation matters in Python. It is how Python knows which lines belong to the `if`." },
  ],
  "py-4": [
    { head: "Loops", text: "A loop repeats code. `for i in range(3)` repeats 3 times, with `i` counting 0, 1, 2. It stops before the number you give. Indent the lines you want repeated.", code: "for i in range(3):\n    print(i)", after: "This prints `0`, `1`, `2`. To count from 1 to 5, use `range(1, 6)`." },
    { head: "While loops", text: "A `while` loop repeats as long as its condition is true. Something inside must change, or the loop never ends. Keep a variable that grows or shrinks.", code: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1", after: "This prints `3`, `2`, `1`. To add things up, start a total at 0 before the loop and add inside it." },
  ],
  "py-5": [
    { head: "Lists", text: "A **list** holds several values in order, in square brackets. Counting starts at **0**: the first item is `[0]`. `len(list)` is how many items. `.append(x)` adds to the end. A negative index counts from the end, so `[-1]` is the last.", code: "fruits = [\"apple\", \"pear\"]\nfruits.append(\"plum\")\nprint(fruits[0])\nprint(len(fruits))\nprint(fruits[-1])", after: "This prints `apple`, `3`, and `plum`." },
    { head: "Useful list tools", text: "`sum(list)` adds up numbers. `max(list)` and `min(list)` find the biggest and smallest. `for item in list:` visits every item.", code: "scores = [70, 85, 92]\nprint(sum(scores))\nprint(max(scores))", after: "That prints `247` and `92`." },
  ],
  "py-6": [
    { head: "Functions", text: "A **function** packages code under a name. `def` starts it. Parameters in parentheses are its inputs. `return` hands a result back. Define it once, then call it as often as you like.", code: "def double(n):\n    return n * 2\n\nprint(double(6))", after: "This prints `12`. The body is indented, and the `def` line ends with a colon." },
    { head: "print versus return", text: "`print` shows something on the screen. `return` gives a value back to the code that called the function so it can be used. A function with no `return` gives back `None`.", code: "def add(a, b):\n    return a + b\n\ntotal = add(2, 3)\nprint(total)", after: "Mistake to avoid: writing `print` inside a function when you needed `return`." },
  ],
  "py-7": [
    { head: "Methods on text", text: "A **method** is a function that belongs to a value, called with a dot. For strings: `.upper()` makes capitals, `.lower()` makes lowercase, `.strip()` removes extra spaces. `len(text)` counts characters.", code: "word = \"python\"\nprint(word.upper())\nprint(len(word))", after: "This prints `PYTHON` and `6`. The original `word` is not changed. Methods give back a new string." },
    { head: "Slices and searching", text: "`word[0:3]` is a **slice**: characters from index 0 up to but not including 3. `word[::-1]` reverses. The word `in` checks if one piece of text is inside another.", code: "word = \"python\"\nprint(word[0:3])\nprint(\"th\" in word)", after: "This prints `pyt` and `True`." },
  ],
  "py-8": [
    { head: "Looking up by name", text: "A **dictionary** stores **key: value** pairs in curly braces. You look a value up by its key instead of a position number. Use square brackets with the key.", code: "ages = {\"Ana\": 15, \"Bo\": 17}\nprint(ages[\"Bo\"])", after: "This prints `17`. If the key doesn't exist, Python raises a `KeyError`." },
    { head: "Changing a dictionary", text: "Assign to a key to add or update it. `\"Ana\" in ages` checks for a key. `.get(key, default)` gives a fallback instead of an error. `len(d)` counts the pairs.", code: "ages[\"Cy\"] = 16\nprint(\"Ana\" in ages)\nprint(ages.get(\"Zed\", 0))", after: "That prints `True` and `0`." },
  ],
  "py-9": [
    { head: "Walking through a list", text: "`for item in items:` runs the block once for every item, with `item` holding the current one. You don't need an index.", code: "colors = [\"red\", \"green\"]\nfor c in colors:\n    print(c.upper())", after: "This prints `RED` then `GREEN`." },
    { head: "Totals, tests and the biggest", text: "Make a variable before the loop and update it inside to keep a total or a best so far. Use `if` inside the loop to only act on some items. The remainder `%` finds evens: `n % 2 == 0`.", code: "total = 0\nfor n in [4, 9, 2]:\n    if n % 2 == 0:\n        total = total + n\nprint(total)", after: "This adds only the even numbers, 4 and 2, and prints `6`." },
  ],
  "py-10": [
    { head: "range with steps", text: "`range(start, stop, step)` counts from `start`, stops before `stop`, and moves by `step`. A negative step counts down. `range(10, 0, -1)` gives 10 down to 1.", code: "for i in range(2, 10, 2):\n    print(i)", after: "This prints `2`, `4`, `6`, `8`." },
    { head: "Loops inside loops", text: "Put a loop inside another and the inner one finishes completely for each turn of the outer one. The total runs are outer times inner. Multiplying a string repeats it: `\"*\" * 5` is `*****`.", code: "for row in range(3):\n    print(\"*\" * (row + 1))", after: "This prints a little triangle: `*`, `**`, `***`." },
  ],
  "py-11": [
    { head: "Reading errors", text: "When Python can't run a line it stops and shows an **error**. The last line names the kind and the reason. `NameError`: a name doesn't exist. `TypeError`: the wrong kind of value. `ValueError`: the right kind but a bad value, like `int(\"hi\")`. `ZeroDivisionError`: divided by zero.", code: "print(int(\"42\") + 1)\nprint(int(\"hi\"))", after: "The first line prints `43`. The second raises a `ValueError` because `\"hi\"` isn't a number." },
    { head: "Catching errors with try", text: "Wrap risky code in `try`. If an error of the named kind happens, the `except` block runs instead of crashing. The program then keeps going.", code: "try:\n    n = int(\"hi\")\nexcept ValueError:\n    n = 0\nprint(n)", after: "This prints `0`. Catch only the specific errors you expect." },
  ],
  "py-12": [
    { head: "How to attack a problem", text: "Say what you want in plain steps first. For FizzBuzz-style problems: loop through the numbers, test each one, print the right thing. Build a tiny version, check it, then add the next rule.", code: "for n in range(1, 4):\n    if n % 3 == 0:\n        print(\"Fizz\")\n    else:\n        print(n)", after: "This prints `1`, `2`, `Fizz`. Then extend it." },
    { head: "Debug by printing", text: "If the output is wrong, print the variables inside the loop to see what Python is really doing, then compare with what you expected. Division with `/` always gives a decimal, so `sum([80, 90, 100]) / 3` is `90.0`.", code: "word = \"level\"\nprint(word[::-1])\nprint(word == word[::-1])", after: "That prints `level` and `True`, because it's the same backward." },
  ],

  "jv-1": [
    { head: "The shape of a Java program", text: "Java is strict about structure. Every program lives inside a **class**. Java starts running at a **method** called `main`. Inside it, `System.out.println(\"...\")` prints a line. Each statement ends with a semicolon.", code: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello!\");\n    }\n}", after: "Curly braces `{ }` wrap each block: the class wraps the method, and the method wraps the statements." },
    { head: "Compile, then run", text: "Java is **compiled**: a tool checks your whole program for mistakes before it runs at all. A missing semicolon or a misspelled word is caught right away as a compile error. This feels strict, but it catches bugs early.", code: "System.out.println(\"A\");\nSystem.out.println(\"B\");", after: "This prints `A` and `B` on separate lines. `print` (without `ln`) would stay on the same line." },
  ],
  "jv-2": [
    { head: "Types come first", text: "In Java you declare a variable's **type** before its name. `int` is a whole number, `double` has decimals, `String` is text (capital S), `boolean` is true or false. A variable can't change type.", code: "int age = 15;\ndouble price = 4.5;\nString name = \"Ada\";\nboolean ready = true;", after: "Putting text in an `int` is a compile error. Strings use double quotes." },
    { head: "Dividing ints", text: "Dividing two `int`s gives an `int`: the decimal part is dropped. `7 / 2` is `3`. If you want decimals, make one of them a `double`: `7.0 / 2` is `3.5`.", code: "System.out.println(7 / 2);\nSystem.out.println(7.0 / 2);", after: "This prints `3` then `3.5`. The `%` operator gives the remainder, so `7 % 2` is `1`." },
  ],
  "jv-3": [
    { head: "Choosing with if", text: "`if` takes a test in parentheses and a block in braces. Add `else if` for more cases and `else` for the rest. Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`.", code: "int n = 10;\nif (n > 5 && n < 20) {\n    System.out.println(\"medium\");\n} else {\n    System.out.println(\"other\");\n}", after: "`&&` means and, `||` means or, `!` means not." },
    { head: "Comparing strings", text: "Never compare Strings with `==`. It checks whether they're the same object, not the same text. Use `.equals()`.", code: "String a = \"hi\";\nif (a.equals(\"hi\")) {\n    System.out.println(\"same\");\n}", after: "`==` is fine for numbers and booleans, but not for Strings." },
  ],
  "jv-4": [
    { head: "for loops", text: "A `for` loop puts three things on one line: start, test, step. `for (int i = 0; i < 3; i++)` starts at 0, keeps going while `i < 3`, and adds 1 each time. `i++` means add one.", code: "for (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}", after: "This prints `0`, `1`, `2`." },
    { head: "while and break", text: "A `while` loop checks its condition before each turn. `break` leaves a loop immediately. For a sum, declare the total before the loop and add inside it.", code: "int total = 0;\nfor (int i = 1; i <= 3; i++) {\n    total = total + i;\n}\nSystem.out.println(total);", after: "That prints `6`." },
  ],
  "jv-5": [
    { head: "Methods", text: "A **method** is a named block of code. Its header has a return type, a name, and parameters with types. `void` means it returns nothing. `return` sends back a value. In a simple `main` program, helper methods are `static`.", code: "static int add(int a, int b) {\n    return a + b;\n}\n\nSystem.out.println(add(2, 3));", after: "This prints `5`. The `int` before `add` is the return type, and each parameter has its own type." },
  ],
  "jv-6": [
    { head: "Arrays", text: "An array holds a fixed number of values of one type. Indexes start at 0. The size is `array.length` with no parentheses. Going past the end throws an exception.", code: "int[] a = {4, 8, 15};\nSystem.out.println(a[0]);\nSystem.out.println(a.length);", after: "This prints `4` and `3`." },
    { head: "Strings are different", text: "A String's size is `s.length()` with parentheses, since it's a method. `s.charAt(0)` reads one character. `s.substring(1, 3)` takes a part. These look similar to arrays but use methods.", code: "String s = \"knight\";\nSystem.out.println(s.length());", after: "This prints `6`. Remember: arrays use `.length`, Strings use `.length()`." },
  ],
  "jv-7": [
    { head: "String methods", text: "Strings are objects with methods: `length()`, `charAt(i)`, `substring(a, b)`, `toUpperCase()`, `toLowerCase()` and `equals(other)`. `substring(a, b)` includes index `a` but stops before `b`.", code: "String s = \"knight\";\nSystem.out.println(s.charAt(0));\nSystem.out.println(s.substring(1, 3));", after: "This prints `k` and `ni`. Always compare text with `equals`, not `==`." },
  ],
  "jv-8": [
    { head: "Integer division and remainders", text: "With two `int`s, `/` drops the decimals: `7 / 2` is `3`. `%` gives what's left over: `7 % 2` is `1`. To keep decimals, cast one side: `(double) 7 / 2` is `3.5`.", code: "System.out.println(7 / 2);\nSystem.out.println(7 % 2);\nSystem.out.println((double) 7 / 2);", after: "This prints `3`, `1`, `3.5`. A cast is a type in parentheses before the value." },
    { head: "The Math class", text: "`Math.max(a, b)` and `Math.min(a, b)` pick the larger or smaller. `Math.pow(2, 3)` raises to a power and returns a `double`, so it prints `8.0`. `Math.sqrt(16)` is `4.0`.", code: "System.out.println(Math.max(4, 9));\nSystem.out.println(Math.pow(2, 3));", after: "That prints `9` and `8.0`." },
  ],
  "jv-9": [
    { head: "while loops", text: "A `while` loop keeps going as long as its condition is true. Something inside it must change the condition, or it runs forever. `i++` adds 1 and `i--` subtracts 1.", code: "int n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n    n--;\n}", after: "This prints `3`, `2`, `1`. Forget `n--` and it never stops." },
    { head: "Nested loops", text: "A loop inside a loop runs its full cycle for each turn of the outer one. 3 outer turns times 2 inner turns is 6 runs. `break` leaves the loop, and `continue` skips to the next turn.", code: "for (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 2; j++) {\n        System.out.println(\"*\");\n    }\n}", after: "This prints 6 stars." },
  ],
  "jv-10": [
    { head: "A list that grows", text: "An array can't change size, but an `ArrayList` can. First `import java.util.ArrayList;`. The type of item goes in angle brackets. `add` puts an item at the end, `get(i)` reads one, `size()` counts them, `remove(i)` deletes one.", code: "import java.util.ArrayList;\n\nArrayList<String> names = new ArrayList<>();\nnames.add(\"Ana\");\nnames.add(\"Bo\");\nSystem.out.println(names.get(0));\nSystem.out.println(names.size());", after: "This prints `Ana` and `2`. Note `size()`, not `length`." },
  ],
  "jv-11": [
    { head: "Classes and objects", text: "A **class** is a blueprint. An **object** is one thing built from it with `new`. A class describes **fields** (data each object holds) and **methods** (things it can do). Use a dot to reach them.", code: "public class Dog {\n    String name;\n    void bark() {\n        System.out.println(\"Woof\");\n    }\n}\n\nDog d = new Dog();\nd.name = \"Rex\";\nd.bark();", after: "`new Dog()` builds a dog. `d.name` is its field, and `d.bark()` calls its method. You can build as many dogs as you like." },
  ],
  "jv-12": [
    { head: "Constructors", text: "A **constructor** is a special method that runs when you write `new`. It has the same name as the class and no return type. Inside, `this` means the object being built. `this.name = name;` stores the parameter in the field.", code: "public class Dog {\n    private String name;\n\n    public Dog(String name) {\n        this.name = name;\n    }\n}", after: "Now `new Dog(\"Rex\")` makes a dog that already has a name." },
    { head: "Private fields and getters", text: "Marking a field `private` means only the class can touch it directly. Other code uses public methods: a **getter** reads it and a **setter** changes it. This protects the data from accidental changes.", code: "public String getName() {\n    return name;\n}", after: "By convention a getter is `get` plus the field name, like `getName()`." },
  ],

  "ar-1": [
    { head: "What an Arduino does", text: "An Arduino is a tiny computer on a board with pins you can connect lights, buttons and sensors to. You write a **sketch** on your computer and upload it over USB. After that the board runs it by itself.", code: "void setup() {\n  // runs once\n}\n\nvoid loop() {\n  // runs again and again\n}", after: "Every sketch has both. `setup()` is for one-time preparation. `loop()` is where the action goes." },
  ],
  "ar-2": [
    { head: "Controlling a pin", text: "A pin is a connector on the board. First tell the board what the pin will do with `pinMode`. An `OUTPUT` pin sends power out. `digitalWrite(13, HIGH)` turns it on (about 5 volts) and `LOW` turns it off. Pin 13 has a tiny built-in LED on most boards.", code: "void setup() {\n  pinMode(13, OUTPUT);\n}", after: "`pinMode` goes in `setup()`, because you only need to set it once." },
    { head: "Blinking", text: "`delay(1000)` makes the board wait 1000 milliseconds, which is one second. A blink is on, wait, off, wait. The board repeats `loop()` forever.", code: "void loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}", after: "That's one blink per second: half a second on and half a second off. 1000 ms = 1 second." },
  ],
  "ar-3": [
    { head: "Reading a button", text: "A button is an **input**. `digitalRead(pin)` returns `HIGH` or `LOW`. A button wired between a pin and ground, with `INPUT_PULLUP`, reads `HIGH` normally and `LOW` while pressed. It's backwards at first, but it needs no extra resistor.", code: "pinMode(2, INPUT_PULLUP);\nif (digitalRead(2) == LOW) {\n  // the button is pressed\n}", after: "Use `==` to compare. A single `=` would assign a value." },
  ],
  "ar-4": [
    { head: "Between on and off", text: "`analogRead(pin)` measures a voltage and returns a number from 0 to 1023. `analogWrite(pin, value)` takes 0 to 255 to dim an LED. It rapidly switches the pin on and off (PWM). It only works on pins marked with a `~`.", code: "int light = analogRead(A0);\nint level = map(light, 0, 1023, 0, 255);\nanalogWrite(9, level);", after: "`map(value, 0, 1023, 0, 255)` converts a reading from one range to another. 512 becomes about 127." },
  ],
  "ar-5": [
    { head: "Talking to your computer", text: "The Serial Monitor shows messages from the board. Call `Serial.begin(9600)` in `setup()` to start. `Serial.println(x)` sends a value and a new line. Both sides must use the same speed, 9600 here.", code: "void setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  Serial.println(analogRead(A0));\n  delay(200);\n}", after: "Printing sensor values is the best way to understand what your board sees." },
  ],
  "ar-6": [
    { head: "Putting it together", text: "A project reads inputs, decides, and controls outputs. A night light reads a light sensor, uses `if` to compare to a threshold, and turns an LED on or off. An LED needs a resistor in series so it doesn't burn out.", code: "int light = analogRead(A0);\nif (light < 300) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}", after: "`delay()` pauses everything, while `millis()` lets you keep track of time without stopping." },
  ],
  "ar-7": [
    { head: "Names instead of numbers", text: "Giving numbers names makes a sketch easy to read. `const int LED_PIN = 13;` makes a constant. `int` is a whole number, `float` has decimals, `bool` is true or false. Declare these above `setup()` and every function can use them.", code: "const int LED_PIN = 13;\nint waitTime = 500;\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(waitTime);\n}", after: "To change the pin later, you only edit one line." },
  ],
  "ar-8": [
    { head: "Your own functions", text: "Write a function to give a group of steps a name. `void` means it doesn't return anything. Call it by writing its name with parentheses. Functions keep `loop()` short, and they can take parameters.", code: "void flash() {\n  digitalWrite(13, HIGH);\n  delay(100);\n  digitalWrite(13, LOW);\n  delay(100);\n}\n\nvoid loop() {\n  flash();\n  flash();\n  delay(1000);\n}", after: "This flashes twice and then pauses for a second." },
  ],
  "ar-9": [
    { head: "for loops and fading", text: "`for (int i = 0; i <= 255; i++)` counts from 0 to 255. Put `analogWrite(9, i)` and a short `delay` inside, and the LED fades up smoothly. Count down with `i--` to fade out.", code: "for (int i = 0; i <= 255; i++) {\n  analogWrite(9, i);\n  delay(5);\n}", after: "`analogWrite` takes 0 to 255 and only works on pins marked `~`." },
  ],
  "ar-10": [
    { head: "Making sound", text: "A piezo buzzer clicks when its pin changes quickly. `tone(8, 440)` plays a 440 Hz note on pin 8 until you call `noTone(8)`. Higher frequency means higher pitch. A third value sets how long, in milliseconds.", code: "tone(8, 440);\ndelay(500);\nnoTone(8);\ndelay(500);", after: "Or `tone(8, 262, 250)` plays a 262 Hz note for 250 ms and stops by itself." },
  ],
  "ar-11": [
    { head: "Sensors give numbers", text: "A photoresistor's resistance changes with light. Wired to an analog pin, `analogRead` turns that into 0 to 1023. Print the values first, find the readings for bright and dark, then pick a threshold between them for your `if`.", code: "int light = analogRead(A0);\nif (light < 300) {\n  // it's dark\n}", after: "An ultrasonic sensor measures distance by timing how long a sound echo takes to come back." },
  ],
  "ar-12": [
    { head: "Plan, wire, test", text: "Break a project into pieces. Wire one thing, test it, then add the next. For a traffic light, test each LED alone first. LEDs need a resistor (often 220 ohms) and have a direction: the longer leg is positive.", code: "digitalWrite(RED, HIGH);\ndelay(2000);\ndigitalWrite(RED, LOW);\ndigitalWrite(GREEN, HIGH);\ndelay(2000);\ndigitalWrite(GREEN, LOW);", after: "If nothing lights, check the pin number, the wiring, and which way the LED is facing." },
  ],
});
