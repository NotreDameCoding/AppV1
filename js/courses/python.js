(function () {
  const Q = NDC.Q;
  NDC.courses.push({
    id: "py", name: "Python", lang: "py", hex: "#6aa6ff", color: "var(--c-py)", glyph: "Py",
    tagline: "Readable, friendly, and everywhere. Great first language.",
    runnable: true,
    units: [
      {
        title: "Hello, Python", blurb: "Print things and store them in variables.",
        lessons: [
          {
            id: "py-1", title: "Print it", blurb: "Make the computer say something.",
            intro: { text: "`print()` shows text on the screen. Text goes inside quotes, so Python knows it's words and not a command.", code: 'print("Hello, world!")' },
            ex: [
              Q.mc("Which line prints Hello?", ['print("Hello")', "print(Hello)", 'Print("Hello")', 'echo "Hello"'], 0, "`print` is lowercase and the words go in quotes."),
              Q.mc("What does this code show on screen?", ["Hi there on one line", "Hi, then there on the next line", "Nothing", "An error"], 1, "Each `print` starts a new line.", 'print("Hi")\nprint("there")'),
              Q.fill("Finish the line so it shows Welcome.", '___("Welcome")', ["print", "Print", "say", "echo"], "print", "Python's command for showing text is `print`, all lowercase."),
              Q.run("Print exactly Hello, NDHS! to the screen.", '# print Hello, NDHS! below\n', [{ out: "Hello, NDHS!" }], "Put the words in quotes inside `print()`.", "Copy the text exactly, including the comma and the exclamation mark."),
              Q.type("What does `print(2 + 3)` show?", "5", "Python does the math first, then prints the result."),
              Q.match("Match each piece to what it does.", [["print()", "shows output"], ["\"quotes\"", "mark text"], ["# note", "a comment Python ignores"], ["( )", "hold what goes in"]], "These four show up in almost every Python program."),
            ],
          },
          {
            id: "py-2", title: "Variables", blurb: "Give values a name so you can reuse them.",
            intro: { text: "A variable is a name that holds a value. Use `=` to store it. An f-string (`f\"...\"`) lets you drop variables into text with curly braces.", code: 'name = "Ada"\nage = 15\nprint(f"{name} is {age}")' },
            ex: [
              Q.mc("Which line makes a variable called `age` equal to 15?", ["age = 15", "15 = age", "age == 15", "let age = 15"], 0, "One `=` stores a value. Two `==` compares values."),
              Q.mc("What does this print?", ["4", "7", "x + 3", "An error"], 1, "`y` becomes 4 + 3, which is 7.", "x = 4\ny = x + 3\nprint(y)"),
              Q.fill("Fill in the variable so it greets Sam.", 'name = "Sam"\nprint(f"Hi {___}")', ["name", '"name"', "Sam", "{name}"], "name", "Inside the braces you write the variable's name, with no quotes."),
              Q.mc("Which of these is a string (text)?", ["42", "3.14", '"42"', "True"], 2, "Anything in quotes is a string, even if it looks like a number."),
              Q.run("The price is 4 and the quantity is 3. Print the total cost.", "price = 4\nqty = 3\n# print the total below\n", [{ out: "12", label: "Prints 12" }, { replace: ["price = 4", "price = 10"], out: "30", label: "Still works if the price changes" }], "Multiply the two variables instead of typing 12.", "Use `price * qty` inside `print()`."),
              Q.order("Put these lines in order to print a greeting.", ['name = "Mia"', 'greeting = "Hello " + name', "print(greeting)"], "A variable has to exist before you can use it."),
            ],
          },
        ],
      },
      {
        title: "Decisions and loops", blurb: "Make the program choose and repeat.",
        lessons: [
          {
            id: "py-3", title: "If and else", blurb: "Run code only when something is true.",
            intro: { text: "`if` runs a block only when its condition is true. The block is indented, and the line ends with a colon. Add `elif` and `else` for other cases.", code: "age = 16\nif age >= 18:\n    print(\"adult\")\nelse:\n    print(\"minor\")" },
            ex: [
              Q.mc("Which comparison checks if `a` equals `b`?", ["a = b", "a == b", "a => b", "a equal b"], 1, "`==` compares. A single `=` stores a value."),
              Q.mc("What does this print?", ["big", "small", "Nothing", "An error"], 0, "7 is greater than 5, so the `if` block runs.", 'n = 7\nif n > 5:\n    print("big")\nelse:\n    print("small")'),
              Q.fill("Add a second test between `if` and `else`.", 'score = 85\nif score >= 90:\n    print("A")\n___ score >= 80:\n    print("B")', ["elif", "else if", "elseif", "otherwise"], "elif", "Python spells it `elif`."),
              Q.mc("What does `print(True and False)` show?", ["True", "False", "None", "An error"], 1, "`and` needs both sides true. Here one side is False."),
              Q.run("Print hot if temp is above 25, otherwise print mild.", "temp = 30\n# write your if/else below\n", [{ out: "hot", label: "30 prints hot" }, { replace: ["temp = 30", "temp = 10"], out: "mild", label: "10 prints mild" }], "Test the variable, so changing `temp` changes the answer.", "if temp > 25: then print hot, else print mild. Don't forget the colons and the indent."),
              Q.type("Which keyword runs when none of the `if` tests are true?", "else", "`else` is the catch-all at the end."),
            ],
          },
          {
            id: "py-4", title: "Loops", blurb: "Repeat things without copy and paste.",
            intro: { text: "A `for` loop repeats code. `range(3)` counts 0, 1, 2. A `while` loop keeps going as long as its condition stays true.", code: "for i in range(3):\n    print(i)" },
            ex: [
              Q.mc("What does this print?", ["0, 1, 2 on separate lines", "1, 2, 3", "0, 1, 2, 3", "3"], 0, "`range(3)` starts at 0 and stops before 3.", "for i in range(3):\n    print(i)"),
              Q.mc("Which numbers does `range(5)` give you?", ["0 1 2 3 4", "1 2 3 4 5", "0 1 2 3 4 5", "5"], 0, "It starts at 0 and stops one before the number."),
              Q.fill("Make this loop run 4 times.", 'for i in ___(4):\n    print("go")', ["range", "loop", "repeat", "while"], "range", "`for ... in range(n)` runs n times."),
              Q.mc("What does this print?", ["3 2 1 on separate lines", "1 2 3", "3 2 1 0", "Nothing, it loops forever"], 0, "`n` shrinks by one each time. When it hits 0 the loop stops.", "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1"),
              Q.run("Print the numbers 1 to 5, one per line.", "# your loop goes here\n", [{ out: "1\n2\n3\n4\n5", label: "Prints 1 through 5" }], "A loop is shorter than five prints.", "`range(1, 6)` starts at 1 and stops before 6."),
              Q.order("Order the lines to add 1 + 2 + 3 and print 6.", ["total = 0", "for n in range(1, 4):", "    total = total + n", "print(total)"], "Start the total at 0, add inside the loop, print after it."),
            ],
          },
        ],
      },
      {
        title: "Lists and functions", blurb: "Hold many things, and package your code.",
        lessons: [
          {
            id: "py-5", title: "Lists", blurb: "One variable, many values.",
            intro: { text: "A list holds several values in order. Counting starts at 0, so the first item is `[0]`. `len()` tells you how many, and `.append()` adds to the end.", code: 'fruits = ["apple", "pear"]\nfruits.append("plum")\nprint(fruits[0])\nprint(len(fruits))' },
            ex: [
              Q.mc("What does this print?", ["red", "green", "blue", "An error"], 1, "Index 0 is red, index 1 is green.", 'colors = ["red", "green", "blue"]\nprint(colors[1])'),
              Q.mc("Which method adds an item to the end of a list?", ["add", "append", "push", "insert_end"], 1, "In Python it's `.append()`."),
              Q.mc("What does this print?", ["2", "3", "15", "4"], 1, "`len` counts the items: three of them.", "nums = [4, 8, 15]\nprint(len(nums))"),
              Q.run("Print the total of all the scores.", "scores = [70, 85, 92]\n# print the total below\n", [{ out: "247", label: "Prints 247" }, { replace: ["scores = \\[70, 85, 92\\]", "scores = [1, 2, 3]"], out: "6", label: "Works for any list" }], "Python has a built-in that adds up a list.", "Try `sum(scores)`, or a loop that adds each score."),
              Q.fill("Add \"dog\" to the list.", 'pets = ["cat"]\npets.___("dog")\nprint(pets)', ["append", "add", "push", "put"], "append", "`append` puts the new item at the end."),
              Q.match("Match each list expression to what it gives you.", [["nums[0]", "the first item"], ["len(nums)", "how many items"], ["nums.append(9)", "adds 9 to the end"], ["nums[-1]", "the last item"]], "Negative indexes count from the end."),
            ],
          },
          {
            id: "py-6", title: "Functions", blurb: "Name a chunk of code and reuse it.",
            intro: { text: "`def` makes a function. It can take inputs (parameters) and hand back a result with `return`. Call it by writing its name with parentheses.", code: "def double(n):\n    return n * 2\n\nprint(double(6))" },
            ex: [
              Q.mc("Which line starts a function called greet?", ["def greet():", "function greet():", "greet() = def", "func greet()"], 0, "Python uses `def`, then the name, then parentheses and a colon."),
              Q.mc("What does this print?", ["6", "12", "double(6)", "None"], 1, "The function returns 6 * 2.", "def double(n):\n    return n * 2\n\nprint(double(6))"),
              Q.fill("Make the function hand back the sum.", "def add(a, b):\n    ___ a + b", ["return", "print", "give", "yield"], "return", "`return` sends the answer back to whoever called the function."),
              Q.run("Write a function square(n) that returns n times n.", "def square(n):\n    # return the square\n    pass\n", [{ append: "print(square(5))", out: "25", label: "square(5) is 25" }, { append: "print(square(-3))", out: "9", label: "square(-3) is 9" }], "Replace `pass` with a return line.", "`return n * n`."),
              Q.run("Write is_even(n). It should return True when n is even.", "def is_even(n):\n    pass\n", [{ append: "print(is_even(4))", out: "True", label: "is_even(4) is True" }, { append: "print(is_even(7))", out: "False", label: "is_even(7) is False" }], "The % operator gives the remainder after dividing.", "n % 2 == 0 is True for even numbers. Return it directly."),
              Q.mc("A function only prints and never returns. What does `x = f()` store in x?", ["The printed text", "None", "0", "An error"], 1, "No `return` means Python hands back `None`."),
            ],
          },
        ],
      },
      {
        title: "Text and dictionaries", blurb: "Work with words and look things up by name.",
        lessons: [
          {
            id: "py-7", title: "String tools", blurb: "Change, slice and search text.",
            intro: { text: "Strings come with built-in tools. `.upper()` and `.lower()` change the case, `len()` counts characters, and a slice like `word[0:3]` grabs part of a string (it stops before the last index). The word `in` checks whether one piece of text is inside another.", code: 'word = "python"\nprint(word.upper())\nprint(word[0:3])\nprint("th" in word)' },
            ex: [
              Q.mc("What does `\"hello\".upper()` give you?", ["HELLO", "Hello", "hello", "An error"], 0, "`.upper()` makes every letter a capital."),
              Q.mc("What does this print?", ["pyt", "pyth", "yth", "pyt on"], 0, "A slice stops before its end index, so `[0:3]` gives characters 0, 1 and 2.", 'word = "python"\nprint(word[0:3])'),
              Q.fill("Make the name all capitals.", 'name = "ada"\nprint(name.___())', ["upper", "caps", "big", "lower"], "upper", "The method is called `upper`."),
              Q.mc("Which line checks whether \"cat\" appears inside `text`?", ['"cat" in text', 'text.has("cat")', 'text == "cat"', 'text.contains("cat")'], 0, "In Python the word `in` does the search."),
              Q.run("Print the word banana in all capital letters.", 'word = "banana"\n# print it in capitals below\n', [{ out: "BANANA" }, { replace: ['word = "banana"', 'word = "kiwi"'], out: "KIWI", label: "Works for any word" }], "Call a string method on the variable.", "`print(word.upper())`."),
              Q.type("What number does `len(\"knight\")` show?", "6", "`len` counts every character: k, n, i, g, h, t.", 'print(len("knight"))'),
            ],
          },
          {
            id: "py-8", title: "Dictionaries", blurb: "Look up values by a name instead of a position.",
            intro: { text: "A dictionary stores pairs: a key and its value. Write it with curly braces. Look a value up with `d[key]`, add or change one by assigning to it, and check whether a key exists with `in`.", code: 'ages = {"Ana": 15, "Bo": 17}\nages["Cy"] = 16\nprint(ages["Bo"])\nprint("Ana" in ages)' },
            ex: [
              Q.mc("What does this print?", ["17", "Bo", "15", "An error"], 0, "`ages[\"Bo\"]` looks up the value stored under the key \"Bo\".", 'ages = {"Ana": 15, "Bo": 17}\nprint(ages["Bo"])'),
              Q.mc("Which brackets make a dictionary?", ["{ }", "[ ]", "( )", "< >"], 0, "Curly braces hold the key: value pairs."),
              Q.fill("Add a score key to the player.", 'player = {"name": "Mia"}\nplayer["score"] ___ 10', ["=", "==", ":", "=>"], "=", "Assigning with `=` adds the key if it isn't there yet."),
              Q.mc("What does `d.get(\"x\", 0)` give when the key \"x\" is missing?", ["0", "An error", "None", "\"x\""], 0, "`.get` returns the fallback you pass instead of crashing."),
              Q.run("Print how many points Sam has.", 'points = {"Ana": 12, "Sam": 9}\n# print Sam\'s points below\n', [{ out: "9" }, { replace: ['"Sam": 9', '"Sam": 20'], out: "20", label: "Reads the dictionary" }], "Look the value up with the key.", 'print(points["Sam"])'),
              Q.match("Match each dictionary expression to what it does.", [['d["k"]', "gets the value for k"], ['d["k"] = 5', "sets k to 5"], ['"k" in d', "checks that k exists"], ["len(d)", "counts the pairs"]], "Four moves cover most dictionary work."),
            ],
          },
        ],
      },
      {
        title: "Loops in depth", blurb: "Walk through data and count with style.",
        lessons: [
          {
            id: "py-9", title: "Looping over lists", blurb: "Do something with every item.",
            intro: { text: "A `for` loop can walk straight through a list: `for item in items:` gives you each item in turn. Combine it with `if` to pick out the ones you want, and with a variable outside the loop to keep a running total or a best-so-far.", code: 'colors = ["red", "green"]\nfor c in colors:\n    print(c.upper())' },
            ex: [
              Q.mc("What does this print?", ["a then b on separate lines", "ab on one line", "[\"a\", \"b\"]", "Nothing"], 0, "The loop runs once for each item.", 'for c in ["a", "b"]:\n    print(c)'),
              Q.fill("Add each score to the running total.", "scores = [3, 5]\ntotal = 0\nfor s in scores:\n    total = total ___ s\nprint(total)", ["+", "-", "*", "=="], "+", "Adding each item to the total builds the sum."),
              Q.run("Print each fruit on its own line, in capital letters.", 'fruits = ["fig", "plum", "kiwi"]\n# loop below\n', [{ out: "FIG\nPLUM\nKIWI" }], "Loop over the list and print inside the loop.", "`for f in fruits:` then print `f.upper()`."),
              Q.run("Print only the even numbers from the list, one per line.", "nums = [1, 2, 3, 4, 5, 6]\n# loop below\n", [{ out: "2\n4\n6" }, { replace: ["nums = \\[1, 2, 3, 4, 5, 6\\]", "nums = [10, 11, 12]"], out: "10\n12", label: "Works for other lists" }], "Test each number inside the loop.", "An even number has no remainder when divided by 2: `n % 2 == 0`."),
              Q.order("Order the lines to print the biggest number in the list.", ["biggest = 0", "for n in [4, 9, 2]:", "    if n > biggest:", "        biggest = n", "print(biggest)"], "Start low, replace the best whenever something bigger shows up, print at the end."),
              Q.type("What does this print?", "6", "The loop adds 1, then 2, then 3.", "t = 0\nfor n in [1, 2, 3]:\n    t = t + n\nprint(t)"),
            ],
          },
          {
            id: "py-10", title: "Counting and nesting", blurb: "Steps, countdowns and loops inside loops.",
            intro: { text: "`range` can take a start, a stop and a step: `range(2, 10, 2)` gives 2, 4, 6, 8. A negative step counts down. You can also put a loop inside another loop: the inner one runs completely for each turn of the outer one. And a string times a number repeats it.", code: 'for i in range(3, 0, -1):\n    print(i)\nprint("*" * 4)' },
            ex: [
              Q.mc("Which numbers does `range(2, 10, 2)` give?", ["2 4 6 8", "2 4 6 8 10", "2 3 4 5", "0 2 4 6 8"], 0, "It starts at 2, jumps by 2, and stops before 10."),
              Q.mc("How many times does this print x?", ["6", "5", "3", "2"], 0, "The inner loop runs 3 times for each of the 2 outer turns: 2 times 3.", 'for i in range(2):\n    for j in range(3):\n        print("x")'),
              Q.fill("Count down from 10 to 1.", "for i in range(10, 0, ___):\n    print(i)", ["-1", "1", "0", "-10"], "-1", "A negative step walks backward."),
              Q.type("What is the last number `range(1, 5)` gives?", "4", "The stop value is never included."),
              Q.run("Print a countdown: 3, 2, 1, each on its own line.", "# your loop goes here\n", [{ out: "3\n2\n1" }], "Use `range` with a negative step.", "`range(3, 0, -1)`."),
              Q.run("Print a row of five stars like *****", "# print the row below\n", [{ out: "*****" }], "A string times a number repeats the string.", 'print("*" * 5)'),
            ],
          },
        ],
      },
      {
        title: "Solid programs", blurb: "Handle errors and build small real things.",
        lessons: [
          {
            id: "py-11", title: "Errors and try", blurb: "Read an error, and survive one.",
            intro: { text: "When Python can't run a line it stops with an error that names the problem: `NameError` means a name doesn't exist, `TypeError` means the wrong kind of value, `ValueError` means the right kind but a bad value. Wrap risky code in `try` and add an `except` to decide what happens instead of crashing. `int(\"42\")` turns text into a number.", code: 'try:\n    n = int("hello")\nexcept ValueError:\n    n = 0\nprint(n)' },
            ex: [
              Q.mc("Which error happens when you use a variable that was never created?", ["NameError", "SyntaxError", "TypeError", "IndexError"], 0, "The name doesn't exist, so it's a `NameError`."),
              Q.mc("What does this print?", ["oops", "42", "Nothing", "A crash"], 0, "`int(\"hi\")` raises a `ValueError`, and the `except` block catches it.", 'try:\n    print(int("hi"))\nexcept ValueError:\n    print("oops")'),
              Q.fill("Catch the division error.", 'try:\n    x = 10 / 0\n___ ZeroDivisionError:\n    print("no")', ["except", "catch", "else", "finally"], "except", "Python calls it `except`, not `catch`."),
              Q.mc("What does `int(\"42\") + 1` give?", ["43", "421", "\"43\"", "An error"], 0, "`int` makes the text a number first, so the math works."),
              Q.run("Convert the text to a number and print it plus 1.", 'text = "41"\n# convert and print below\n', [{ out: "42" }, { replace: ['text = "41"', 'text = "99"'], out: "100", label: "Works for other numbers" }], "Turn the text into a number before adding.", "`print(int(text) + 1)`."),
              Q.order("Order the lines so a bad number falls back to 0.", ["try:", '    n = int("x")', "except ValueError:", "    n = 0", "print(n)"], "`try` the risky line, `except` handles the failure."),
            ],
          },
          {
            id: "py-12", title: "Mini programs", blurb: "Small problems you can solve completely.",
            intro: { text: "Real programs are small ideas combined: loops, conditions, lists and strings. Break a problem into steps, solve one step at a time, and print values along the way to see what's happening. These are classic practice problems.", code: 'word = "level"\nprint(word == word[::-1])' },
            ex: [
              Q.run("Print the numbers 1 to 15, but print Fizz instead of every multiple of 3.", "# loop below\n", [{ out: "1\n2\nFizz\n4\n5\nFizz\n7\n8\nFizz\n10\n11\nFizz\n13\n14\nFizz" }], "Loop from 1 to 15 and test each number.", "A multiple of 3 has `n % 3 == 0`."),
              Q.run("Print the average of the scores.", "scores = [80, 90, 100]\n# print the average below\n", [{ out: "90.0" }, { replace: ["scores = \\[80, 90, 100\\]", "scores = [1, 2]"], out: "1.5", label: "Works for other lists" }], "Add them up and divide by how many there are.", "`sum(scores) / len(scores)`."),
              Q.run("Print the word backwards.", 'word = "knight"\n# print it reversed below\n', [{ out: "thgink" }, { replace: ['word = "knight"', 'word = "dragon"'], out: "nogard", label: "Works for any word" }], "A slice with a step of -1 walks backward.", "`print(word[::-1])`."),
              Q.run("Count how many vowels (a, e, i, o, u) are in the word and print the count.", 'word = "education"\n# count below\n', [{ out: "5" }, { replace: ['word = "education"', 'word = "sky"'], out: "0", label: "Works for other words" }], "Keep a counter and loop over the letters.", 'Start `count = 0`, then `if c in "aeiou":` add 1.'),
              Q.type("What does `\"ab\" * 3` show?", "ababab", "Multiplying a string repeats it."),
              Q.mc("Your program prints the wrong answer. What helps most?", ["Print the values in the middle to see where it goes wrong", "Delete everything and start over", "Add more loops", "Ignore it"], 0, "Printing as you go shows exactly where the program stops matching your plan."),
            ],
          },
        ],
      },
    ],
  });
})();
