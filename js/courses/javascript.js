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
      {
        title: "Text and objects", blurb: "Handle words, and group related values.",
        lessons: [
          {
            id: "js-7", title: "Strings", blurb: "Change, slice and search text.",
            intro: { text: "Strings have helpful methods: `.toUpperCase()`, `.toLowerCase()`, `.includes()` and `.slice()`. The `.length` property counts characters. Template literals use backticks and `${}` to drop values into text.", code: 'const word = "python";\nconsole.log(word.toUpperCase());\nconsole.log(word.slice(0, 3));\nconsole.log(`${word} has ${word.length} letters`);' },
            ex: [
              Q.mc("What does `\"hello\".toUpperCase()` give you?", ["HELLO", "Hello", "hello", "An error"], 0, "It makes every letter a capital."),
              Q.mc("What does this print?", ["pyt", "pyth", "yth", "py"], 0, "`slice(0, 3)` takes characters 0, 1 and 2. It stops before 3.", 'const word = "python";\nconsole.log(word.slice(0, 3));'),
              Q.fill("Check whether the sentence contains the word cat.", 'const s = "the cat sat";\nconsole.log(s.___("cat"));', ["includes", "has", "contains", "find"], "includes", "In JavaScript the method is `includes`."),
              Q.mc("Which one builds the text `Hi Ana` using a variable called name?", ["`Hi ${name}`", '"Hi ${name}"', "'Hi {name}'", "`Hi name`"], 0, "Template literals use backticks, and `${ }` holds the variable."),
              Q.run("Print the word banana in all capital letters.", 'const word = "banana";\n// print it in capitals below\n', [{ out: "BANANA" }, { replace: ['const word = "banana"', 'const word = "kiwi"'], out: "KIWI", label: "Works for any word" }], "Call a string method on the variable.", "`console.log(word.toUpperCase());`"),
              Q.type("What number does `\"knight\".length` give?", "6", "`length` counts every character."),
            ],
          },
          {
            id: "js-8", title: "Objects", blurb: "Group related values under names.",
            intro: { text: "An object holds named values called properties. Write it with curly braces. Read a property with a dot, `player.name`, or with brackets, `player[\"name\"]`. You can add or change properties by assigning to them.", code: 'const player = { name: "Mia", score: 10 };\nplayer.score = 25;\nplayer.level = 2;\nconsole.log(player.name, player.score);' },
            ex: [
              Q.mc("What does this print?", ["17", "Bo", "age", "undefined"], 0, "`ages.Bo` reads the value stored under the name Bo.", 'const ages = { Ana: 15, Bo: 17 };\nconsole.log(ages.Bo);'),
              Q.mc("Which brackets make an object?", ["{ }", "[ ]", "( )", "< >"], 0, "Curly braces hold the name: value pairs."),
              Q.fill("Change the score to 99.", 'const p = { score: 10 };\np.score ___ 99;\nconsole.log(p.score);', ["=", "==", ":", "=>"], "=", "Assign with a single `=`."),
              Q.mc("What does reading a property that doesn't exist give you?", ["undefined", "0", "An error", "null"], 0, "JavaScript quietly returns `undefined`."),
              Q.run("Print how many points Sam has.", "const points = { Ana: 12, Sam: 9 };\n// print Sam's points below\n", [{ out: "9" }, { replace: ["Sam: 9", "Sam: 20"], out: "20", label: "Reads the object" }], "Read the property with a dot.", "`console.log(points.Sam);`"),
              Q.match("Match each expression to what it does.", [["p.name", "reads a property"], ["p.age = 16", "sets a property"], ["Object.keys(p)", "lists the property names"], ["{ }", "makes an object"]], "Dots read, assignments write."),
            ],
          },
        ],
      },
      {
        title: "Array power", blurb: "Transform and search lists.",
        lessons: [
          {
            id: "js-9", title: "map and filter", blurb: "Build new arrays from old ones.",
            intro: { text: "`.map()` makes a new array by running a function on every item. `.filter()` makes a new array with only the items that pass a test. Neither changes the original. The arrow function `n => n * 2` is a short way to write a small function.", code: "const nums = [1, 2, 3, 4];\nconst doubled = nums.map(n => n * 2);\nconst big = nums.filter(n => n > 2);\nconsole.log(doubled.join(\",\"), big.join(\",\"));" },
            ex: [
              Q.mc("What does `[1, 2, 3].map(n => n + 1)` give?", ["[2, 3, 4]", "[1, 2, 3]", "[1, 2, 3, 1]", "6"], 0, "`map` runs the function on every item and collects the results."),
              Q.mc("What does `[5, 12, 8, 20].filter(n => n > 10)` give?", ["[12, 20]", "[5, 8]", "[5, 12, 8, 20]", "2"], 0, "`filter` keeps only the items where the test is true."),
              Q.fill("Triple every number.", "const out = [1, 2, 3].___(n => n * 3);", ["map", "filter", "forEach", "find"], "map", "Use `map` when you want one result per item."),
              Q.run("Use map to multiply every number by 10, then print them joined with dashes.", "const nums = [1, 2, 3];\n// print the new numbers below\n", [{ out: "10-20-30" }], "`map` returns a new array. Then join it into one string.", 'console.log(nums.map(n => n * 10).join("-"));'),
              Q.run("Use filter to keep only numbers over 10, then print how many there are.", "const nums = [4, 12, 30, 7, 15];\n// print the count below\n", [{ out: "3" }, { replace: ["\\[4, 12, 30, 7, 15\\]", "[1, 2]"], out: "0", label: "Works for other arrays" }], "`filter` gives an array, and arrays have a `length`.", "`nums.filter(n => n > 10).length`"),
              Q.match("Match each array method to what it does.", [[".map()", "transforms every item"], [".filter()", "keeps items that pass a test"], [".push()", "adds to the end"], [".join()", "glues items into one string"]], "These four cover most array work."),
            ],
          },
          {
            id: "js-10", title: "Looping and math", blurb: "for...of, Math and running totals.",
            intro: { text: "`for (const x of list)` walks through every item without an index. The `Math` object has `Math.max`, `Math.min`, `Math.round` and `Math.floor`. Spread an array into a function with `...`, like `Math.max(...nums)`.", code: 'const names = ["ada", "bo"];\nfor (const n of names) {\n  console.log(n);\n}\nconsole.log(Math.max(3, 9, 4));' },
            ex: [
              Q.mc("What does `Math.round(4.6)` give?", ["5", "4", "4.6", "6"], 0, "It rounds to the nearest whole number."),
              Q.mc("What does `Math.floor(4.9)` give?", ["4", "5", "4.9", "0"], 0, "`floor` always rounds down."),
              Q.fill("Loop over every name.", 'for (const name ___ ["a", "b"]) {\n  console.log(name);\n}', ["of", "in", "at", "each"], "of", "`for...of` walks through the items."),
              Q.run("Print the largest number using Math.max.", "const nums = [3, 9, 4];\n// print the biggest below\n", [{ out: "9" }, { replace: ["\\[3, 9, 4\\]", "[50, 2]"], out: "50", label: "Works for other arrays" }], "Math.max takes separate numbers. Spread the array into it.", "`console.log(Math.max(...nums));`"),
              Q.run("Loop with for...of and print each name in capital letters.", 'const names = ["ada", "bo"];\n// loop below\n', [{ out: "ADA\nBO" }], "Use `for (const n of names)` and a string method.", "`console.log(n.toUpperCase());`"),
              Q.type("What does this print?", "6", "The loop adds 1, then 2, then 3.", "let t = 0;\nfor (const n of [1, 2, 3]) {\n  t += n;\n}\nconsole.log(t);"),
            ],
          },
        ],
      },
      {
        title: "Toward the browser", blurb: "How JavaScript talks to a page, and small projects.",
        lessons: [
          {
            id: "js-11", title: "The DOM", blurb: "How code finds and changes page elements.",
            intro: { text: "In a browser, the page is a tree of objects called the DOM. `document.querySelector(\"#title\")` finds an element using a CSS selector. You can change its `.textContent` or its `.style`. `addEventListener(\"click\", fn)` runs a function when something is clicked.", code: 'const title = document.querySelector("#title");\ntitle.textContent = "Welcome!";\ntitle.addEventListener("click", () => {\n  title.style.color = "gold";\n});' },
            ex: [
              Q.mc("What does `document.querySelector(\".card\")` return?", ["The first element with the class card", "Every element with the class card", "The text of the card", "A new card"], 0, "`querySelector` gives back the first match."),
              Q.mc("Which property changes the text inside an element?", ["textContent", "innerText2", "words", "label"], 0, "`textContent` reads or sets an element's text."),
              Q.fill("Run the function when the button is clicked.", 'btn.addEventListener("___", () => {\n  alert("hi");\n});', ["click", "press", "tap", "onclick"], "click", "The event name is `click`."),
              Q.mc("In `querySelector(\"#score\")`, what does the `#` mean?", ["Find the element with that id", "Find a class", "Comment", "Number"], 0, "A hash selects by id, just like in CSS."),
              Q.order("Order the lines to change a heading when it's clicked.", ['const h = document.querySelector("h1");', 'h.addEventListener("click", () => {', '  h.textContent = "Clicked!";', "});"], "Find it first, then listen, then change it."),
              Q.match("Match each piece to its job.", [["querySelector", "finds an element"], ["textContent", "its text"], ["addEventListener", "reacts to events"], ["style", "its inline CSS"]], "These four power most small interactive pages."),
            ],
          },
          {
            id: "js-12", title: "Mini programs", blurb: "Classic problems, solved in JavaScript.",
            intro: { text: "Real programs are small ideas combined: loops, conditions, arrays and strings. Break the problem into steps, solve one step at a time, and `console.log` values along the way to see what's happening.", code: 'const word = "level";\nconst back = word.split("").reverse().join("");\nconsole.log(word === back);' },
            ex: [
              Q.run("Print the numbers 1 to 15, but print Fizz instead of every multiple of 3.", "// loop below\n", [{ out: "1\n2\nFizz\n4\n5\nFizz\n7\n8\nFizz\n10\n11\nFizz\n13\n14\nFizz" }], "Loop from 1 to 15 and test each number.", "A multiple of 3 has `i % 3 === 0`."),
              Q.run("Print the average of the scores.", "const scores = [80, 90, 100];\n// print the average below\n", [{ out: "90" }, { replace: ["\\[80, 90, 100\\]", "[1, 2]"], out: "1.5", label: "Works for other arrays" }], "Add them up and divide by how many there are.", "Use a loop for the total, then divide by `scores.length`."),
              Q.run("Print the word backwards.", 'const word = "knight";\n// print it reversed below\n', [{ out: "thgink" }, { replace: ['"knight"', '"dragon"'], out: "nogard", label: "Works for any word" }], "Split into letters, reverse the array, join it back.", '`word.split("").reverse().join("")`'),
              Q.run("Count how many vowels (a, e, i, o, u) are in the word and print the count.", 'const word = "education";\n// count below\n', [{ out: "5" }, { replace: ['"education"', '"sky"'], out: "0", label: "Works for other words" }], "Keep a counter and loop over the letters.", 'Start `let count = 0;`, then `if ("aeiou".includes(c)) count++;`'),
              Q.type("What does `\"ab\".repeat(3)` give?", "ababab", "`repeat` repeats a string."),
              Q.mc("Your program prints the wrong answer. What helps most?", ["console.log values in the middle to see where it goes wrong", "Delete everything and start over", "Add more loops", "Ignore it"], 0, "Logging as you go shows exactly where the program stops matching your plan."),
            ],
          },
        ],
      },
    ],
  });
})();
