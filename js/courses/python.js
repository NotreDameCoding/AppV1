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
    ],
  });
})();
