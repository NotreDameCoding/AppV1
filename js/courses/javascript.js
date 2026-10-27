(function () {
  const Q = NDC.Q;
  NDC.courses.push({
    id: "js", name: "JavaScript", lang: "js", hex: "#e6d84a", color: "var(--c-js)", glyph: "JS",
    tagline: "The language of the web. It makes pages react to people.",
    runnable: true,
    units: [
      {
        title: "Hello, JavaScript", blurb: "Print values and name them.",
        lessons: [
          {
            id: "js-1", title: "console.log", blurb: "Your window into what the code is doing.",
            intro: { text: "`console.log()` prints a value so you can see it. Text goes in quotes, and numbers don't need any.", code: 'console.log("Hello!");\nconsole.log(2 + 3);' },
            ex: [
              Q.mc("Which line prints Hello?", ['console.log("Hello");', 'print("Hello");', 'log.console("Hello");', 'echo("Hello");'], 0, "In JavaScript you print with `console.log`."),
              Q.mc("What does this print?", ["5", "23", "2+3", "An error"], 1, "With quotes they're text, so `+` glues them together.", 'console.log("2" + "3");'),
              Q.fill("Fill in the method.", 'console.___("Hello");', ["log", "print", "say", "write"], "log", "`console.log` is the one to remember."),
              Q.run("Print exactly Hello, NDHS! to the console.", "// print Hello, NDHS! below\n", [{ out: "Hello, NDHS!" }], "Put the words in quotes inside `console.log()`.", "console.log(\"Hello, NDHS!\");"),
              Q.type("What does `console.log(10 - 4)` print?", "6", "JavaScript does the subtraction first."),
              Q.match("Match each piece to what it does.", [["console.log()", "prints a value"], [";", "ends a statement"], ["// note", "a comment"], ["\"text\"", "a string"]], "These show up in almost every script."),
            ],
          },
          {
            id: "js-2", title: "let and const", blurb: "Store values under a name.",
            intro: { text: "`const` makes a name that can't be reassigned. `let` makes one that can. Template strings use backticks and `${}` to mix values into text.", code: "const name = \"Ari\";\nlet score = 10;\nscore = score + 5;\nconsole.log(`${name}: ${score}`);" },
            ex: [
              Q.mc("Which one can't be reassigned later?", ["let", "const", "Both can", "Neither can"], 1, "`const` locks the name to its first value."),
              Q.mc("What does this print?", ["2", "5", "7", "x + 5"], 2, "x starts at 2, then becomes 2 + 5.", "let x = 2;\nx = x + 5;\nconsole.log(x);"),
              Q.fill("Declare a name that will never change.", '___ school = "NDHS";', ["const", "string", "dim", "int"], "const", "JavaScript has no `int` or `string` keyword for declaring."),
              Q.mc("What does this print?", ["Hi Lee", "Hi ${n}", "Hi n", "An error"], 0, "Backticks and `${}` put the value inside the text.", "const n = \"Lee\";\nconsole.log(`Hi ${n}`);"),
              Q.run("Print the area of a 6 by 4 rectangle.", "const w = 6;\nconst h = 4;\n// print the area below\n", [{ out: "24", label: "Prints 24" }, { replace: ["const w = 6", "const w = 10"], out: "40", label: "Still works if w changes" }], "Use the variables instead of typing 24.", "console.log(w * h);"),
              Q.mc("What does `console.log(typeof 5)` print?", ["number", "integer", "int", "5"], 0, "JavaScript has one number type, and `typeof` names it."),
            ],
          },
        ],
      },
      {
        title: "Logic", blurb: "Decide, then repeat.",
        lessons: [
          {
            id: "js-3", title: "Conditionals", blurb: "Different code for different situations.",
            intro: { text: "`if` / `else` picks a path. Use `===` to compare. It checks the value and the type, which avoids surprises. `&&` means and, `||` means or.", code: "const age = 17;\nif (age >= 18) {\n  console.log(\"adult\");\n} else {\n  console.log(\"minor\");\n}" },
            ex: [
              Q.mc("Which operator is the safe way to check equality?", ["=", "==", "===", "=>"], 2, "`===` compares value and type. `=` stores a value."),
              Q.mc("What does this print?", ["true", "false", "undefined", "An error"], 1, "A number and a string are different types, so `===` says false.", 'console.log(5 === "5");'),
              Q.fill("Add the else branch.", "if (x > 0) {\n  console.log(\"positive\");\n} ___ {\n  console.log(\"not positive\");\n}", ["else", "elif", "otherwise", "then"], "else", "JavaScript uses `else`, and `else if` for extra cases."),
              Q.mc("What does this print?", ["adult", "minor", "Nothing", "An error"], 1, "17 is not >= 18.", "let age = 17;\nif (age >= 18) console.log(\"adult\");\nelse console.log(\"minor\");"),
              Q.run("Print even or odd for the number n.", "const n = 8;\n// print even or odd below\n", [{ out: "even", label: "8 prints even" }, { replace: ["n = 8", "n = 7"], out: "odd", label: "7 prints odd" }], "The % operator gives a remainder.", "if (n % 2 === 0) console.log(\"even\"); else console.log(\"odd\");"),
              Q.mc("What does `&&` mean?", ["or", "and", "not", "equals"], 1, "Both sides have to be true."),
            ],
          },
          {
            id: "js-4", title: "Loops", blurb: "Do something many times.",
            intro: { text: "A `for` loop has three parts: a starting point, a condition to keep going, and a step. A `while` loop only needs the condition.", code: "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}" },
            ex: [
              Q.mc("What does this print?", ["0, 1, 2", "1, 2, 3", "0, 1, 2, 3", "3"], 0, "i starts at 0 and the loop stops when i reaches 3.", "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}"),
              Q.fill("Add the step that counts up by one.", "for (let i = 0; i < 3; ___) {\n  console.log(i);\n}", ["i++", "i--", "i = 3", "i == 1"], "i++", "`i++` adds one each time around."),
              Q.mc("What does this print last?", ["8", "16", "32", "20"], 2, "1, 2, 4, 8, 16, then 32 stops the loop (32 is not < 20).", "let n = 1;\nwhile (n < 20) {\n  n = n * 2;\n}\nconsole.log(n);"),
              Q.run("Print the numbers 1 to 5, one per line.", "// loop below\n", [{ out: "1\n2\n3\n4\n5", label: "Prints 1 through 5" }], "A for loop that starts at 1 and stops after 5.", "for (let i = 1; i <= 5; i++) { console.log(i); }"),
              Q.run("Print the sum of the numbers from 1 to 10.", "let total = 0;\n// add them up below\n", [{ out: "55", label: "Prints 55" }], "Add i to total inside the loop, then log it after.", "total += i; inside a loop from 1 to 10."),
              Q.mc("What usually causes an infinite loop?", ["A condition that never becomes false", "Using let", "Too many console.log calls", "A missing semicolon"], 0, "If nothing changes the condition, the loop never ends."),
            ],
          },
        ],
      },
      {
        title: "Functions and arrays", blurb: "Reusable code and lists of things.",
        lessons: [
          {
            id: "js-5", title: "Functions", blurb: "Package code you can reuse.",
            intro: { text: "A function takes inputs and can `return` an output. Arrow functions are a shorter way to write them.", code: "function double(n) {\n  return n * 2;\n}\nconst triple = (n) => n * 3;\nconsole.log(double(4), triple(4));" },
            ex: [
              Q.mc("Which line defines a function named greet?", ["function greet() {}", "def greet():", "greet = function", "fn greet() {}"], 0, "JavaScript uses the `function` keyword."),
              Q.mc("What does this print?", ["4", "8", "double(4)", "undefined"], 1, "It returns 4 * 2.", "function double(n) {\n  return n * 2;\n}\nconsole.log(double(4));"),
              Q.fill("Finish the arrow function.", "const add = (a, b) ___ a + b;", ["=>", "->", "=", "=="], "=>", "The arrow `=>` separates the inputs from the result."),
              Q.run("Write a function square(n) that returns n times n.", "function square(n) {\n  // return the square\n}\n", [{ append: "console.log(square(5));", out: "25", label: "square(5) is 25" }, { append: "console.log(square(-3));", out: "9", label: "square(-3) is 9" }], "Remember to `return`.", "return n * n;"),
              Q.run("Write isAdult(age). It should return true for 18 and over.", "function isAdult(age) {\n  \n}\n", [{ append: "console.log(isAdult(20));", out: "true", label: "isAdult(20) is true" }, { append: "console.log(isAdult(15));", out: "false", label: "isAdult(15) is false" }], "A comparison already gives you true or false.", "return age >= 18;"),
              Q.mc("What's the difference between `return` and `console.log`?", ["return hands a value back, log just prints it", "They are the same", "log hands a value back, return prints it", "return only works with numbers"], 0, "Return gives the value to the code that called the function."),
            ],
          },
          {
            id: "js-6", title: "Arrays", blurb: "Lists you can slice, map and filter.",
            intro: { text: "An array holds values in order, starting at index 0. `.push()` adds to the end. `.map()` makes a new array by changing each item, and `.filter()` keeps only the items that pass a test.", code: "const nums = [1, 2, 3];\nnums.push(4);\nconsole.log(nums.map((n) => n * 2));" },
            ex: [
              Q.mc("What does this print?", ["10", "20", "30", "undefined"], 1, "Index 1 is the second item.", "const a = [10, 20, 30];\nconsole.log(a[1]);"),
              Q.mc("Which method adds an item to the end of an array?", ["push", "append", "add", "insert"], 0, "JavaScript uses `.push()`."),
              Q.mc("What does `[1, 2, 3].length` give?", ["2", "3", "4", "undefined"], 1, "Three items, so the length is 3."),
              Q.run("Print the doubled numbers joined by commas, like 2,4,6,8.", "const nums = [1, 2, 3, 4];\n// print the doubled numbers below\n", [{ out: "2,4,6,8", label: "Prints 2,4,6,8" }, { replace: ["\\[1, 2, 3, 4\\]", "[5, 6]"], out: "10,12", label: "Works for any array" }], "`.map()` changes every item, and `.join(\",\")` turns the array into text.", "console.log(nums.map((n) => n * 2).join(\",\"));"),
              Q.fill("Keep only the even numbers.", "const evens = nums.___((n) => n % 2 === 0);", ["filter", "map", "push", "find"], "filter", "`filter` keeps the items where the test returns true."),
              Q.match("Match each array tool to what it does.", [["push", "adds to the end"], ["pop", "removes the last item"], ["length", "how many items"], ["map", "changes every item"]], "These four cover a lot of everyday code."),
            ],
          },
        ],
      },
    ],
  });
})();
