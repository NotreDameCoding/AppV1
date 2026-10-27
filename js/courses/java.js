(function () {
  const Q = NDC.Q;
  NDC.courses.push({
    id: "jv", name: "Java", lang: "jv", hex: "#ff8a4c", color: "var(--c-jv)", glyph: "Jv",
    tagline: "Strict and structured. The language of AP Computer Science.",
    runnable: false,
    units: [
      {
        title: "First program", blurb: "How a Java program is put together.",
        lessons: [
          {
            id: "jv-1", title: "Anatomy of a program", blurb: "Class, main, println.",
            intro: { text: "Every Java program lives inside a class. Execution starts in the `main` method. `System.out.println` prints a line. Most statements end with a semicolon.", code: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello!\");\n    }\n}" },
            ex: [
              Q.mc("Where does a Java program start running?", ["The main method", "The first comment", "The last line", "println"], 0, "The JVM looks for `main` and begins there."),
              Q.fill("Finish the print statement.", 'System.out.___("Hi");', ["println", "print_line", "echo", "write"], "println", "`println` prints and moves to the next line."),
              Q.mc("What ends most Java statements?", ["A semicolon", "A period", "A colon", "Nothing"], 0, "Forget the `;` and the compiler will tell you."),
              Q.mc("What does this print?", ["A then B on separate lines", "AB on one line", "Only B", "An error"], 0, "`println` ends each line.", 'System.out.println("A");\nSystem.out.println("B");'),
              Q.order("Put the lines in order to build a complete program.", ["public class Main {", "    public static void main(String[] args) {", "        System.out.println(\"Go!\");", "    }", "}"], "The class wraps the method, and the method wraps the statement."),
              Q.match("Match each piece to its job.", [["class", "container for code"], ["main", "where the program starts"], ["println", "prints a line"], [";", "ends a statement"]], "Four things you'll write in every program."),
            ],
          },
          {
            id: "jv-2", title: "Types and variables", blurb: "Java wants to know what kind of value each variable holds.",
            intro: { text: "You declare a variable's type before its name. `int` is a whole number, `double` has decimals, `String` is text, and `boolean` is true or false. Dividing two ints gives an int, so `7 / 2` is `3`.", code: 'int age = 15;\ndouble price = 9.99;\nString name = "Ada";\nboolean ready = true;' },
            ex: [
              Q.mc("Which type stores a whole number?", ["int", "double", "String", "boolean"], 0, "`int` is for whole numbers."),
              Q.fill("Pick the type for a price with decimals.", "___ price = 9.99;", ["double", "int", "String", "boolean"], "double", "`int` would drop the decimal part."),
              Q.mc("Which line is valid Java?", ["int age = 15;", "age int = 15;", "int age == 15;", "Int age = 15;"], 0, "Type first, then the name, then `=` and the value."),
              Q.mc("What does this print?", ["3", "3.5", "4", "3.0"], 0, "Both numbers are ints, so Java drops the remainder.", "System.out.println(7 / 2);"),
              Q.type("Which type holds true or false?", "boolean", "`boolean` has exactly two values."),
              Q.match("Match each type to what it holds.", [["int", "whole numbers"], ["double", "decimal numbers"], ["String", "text"], ["boolean", "true or false"]], "Capital S in `String`, and lowercase for the rest."),
            ],
          },
        ],
      },
      {
        title: "Control flow", blurb: "Choose a path, repeat a block.",
        lessons: [
          {
            id: "jv-3", title: "Conditions", blurb: "if, else, and combining tests.",
            intro: { text: "`if` needs parentheses around the test and braces around the block. `&&` is and, `||` is or, and `!` flips true and false. Compare Strings with `.equals()`, never `==`.", code: "int n = 10;\nif (n > 5 && n < 20) {\n    System.out.println(\"in range\");\n} else {\n    System.out.println(\"out\");\n}" },
            ex: [
              Q.mc("Which operator checks whether two ints are equal?", ["==", "=", "=>", "equals"], 0, "One `=` stores. Two `==` compares."),
              Q.mc("What does this print?", ["yes", "no", "Nothing", "An error"], 1, "10 is not less than 8, so the `&&` is false.", "int n = 10;\nif (n > 5 && n < 8) {\n    System.out.println(\"yes\");\n} else {\n    System.out.println(\"no\");\n}"),
              Q.fill("x must be between 0 and 10. Join the two tests.", "if (x > 0 ___ x < 10)", ["&&", "and", "+", "=>"], "&&", "Java writes \"and\" as `&&`."),
              Q.mc("What does this print?", ["true", "false", "Nothing", "An error"], 1, "`!true` is false, and `false || false` is false.", "System.out.println(!true || false);"),
              Q.mc("How should you compare two Strings?", ["a.equals(b)", "a == b", "a = b", "a.same(b)"], 0, "`==` checks if they're the same object. `.equals()` checks the text."),
              Q.order("Put the lines in order.", ["if (score >= 90) {", "    System.out.println(\"A\");", "} else {", "    System.out.println(\"Keep going\");", "}"], "The else attaches right after the closing brace."),
            ],
          },
          {
            id: "jv-4", title: "Loops", blurb: "for and while.",
            intro: { text: "A `for` loop packs the start, the test and the step on one line. A `while` loop checks a condition each time. `break` leaves a loop early.", code: "for (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}" },
            ex: [
              Q.mc("What does this print?", ["0, 1, 2", "1, 2, 3", "0, 1, 2, 3", "3"], 0, "i starts at 0 and stops before 3.", "for (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}"),
              Q.fill("Count up by one each time.", "for (int i = 0; i < 5; ___)", ["i++", "i--", "i == 5", "i = 0"], "i++", "`i++` is short for `i = i + 1`."),
              Q.mc("What does this print?", ["16", "20", "32", "8"], 2, "n goes 1, 2, 4, 8, 16, 32. It stops once n is at least 20.", "int n = 1;\nwhile (n < 20) {\n    n = n * 2;\n}\nSystem.out.println(n);"),
              Q.mc("How many times does the loop body run?", ["3", "4", "5", "0"], 1, "i is 1, 2, 3 and 4. That's four times.", "for (int i = 1; i <= 4; i++) { ... }"),
              Q.type("Which keyword leaves a loop early?", "break", "`break` jumps out of the nearest loop."),
              Q.order("Put these lines in order to add 1 + 2 + 3.", ["int total = 0;", "for (int n = 1; n <= 3; n++) {", "    total = total + n;", "}", "System.out.println(total);"], "Set up the total first, add inside the loop, print after."),
            ],
          },
        ],
      },
      {
        title: "Structure", blurb: "Methods, arrays and strings.",
        lessons: [
          {
            id: "jv-5", title: "Methods", blurb: "Name a block of code and call it.",
            intro: { text: "A method has a return type, a name, and parameters. `void` means it returns nothing. Inside a static `main`, helper methods are marked `static` too.", code: "static int add(int a, int b) {\n    return a + b;\n}\n\nint total = add(2, 3);" },
            ex: [
              Q.mc("What does `static int add(int a, int b)` return?", ["An int", "A String", "Nothing", "A boolean"], 0, "The word before the name is the return type."),
              Q.mc("What does this print?", ["8", "16", "4", "square(4)"], 1, "square(4) returns 4 * 4.", "static int square(int n) {\n    return n * n;\n}\n// ...\nSystem.out.println(square(4));"),
              Q.fill("This method prints but returns nothing.", 'static ___ greet() {\n    System.out.println("Hi");\n}', ["void", "int", "null", "empty"], "void", "`void` means no value comes back."),
              Q.mc("Which call is correct for `add(int a, int b)`?", ["add(2, 3)", "add(2)", "add 2, 3", "add[2, 3]"], 0, "Pass one value for each parameter, in order."),
              Q.order("Put the lines in order to define a method.", ["static int triple(int n) {", "    return n * 3;", "}"], "Signature, body, closing brace."),
              Q.type("What return type means a method gives nothing back?", "void", "`void` is for methods that only do something."),
            ],
          },
          {
            id: "jv-6", title: "Arrays and Strings", blurb: "Collections and text tools.",
            intro: { text: "An array has a fixed size and starts at index 0. Its size is `array.length` (no parentheses). A String's size is `s.length()` (with parentheses). Going past the end throws an exception.", code: "int[] a = {4, 8, 15};\nSystem.out.println(a[1]);\nString s = \"code\";\nSystem.out.println(s.length());" },
            ex: [
              Q.mc("What does this print?", ["4", "8", "15", "1"], 1, "Index 1 is the second item.", "int[] a = {4, 8, 15};\nSystem.out.println(a[1]);"),
              Q.mc("How do you get the length of a String named s?", ["s.length()", "s.length", "length(s)", "s.size()"], 0, "Strings use a method, so it has parentheses."),
              Q.fill("Print the length of the word.", 'String s = "code";\nSystem.out.println(s.___());', ["length", "size", "len", "count"], "length", "That prints 4."),
              Q.mc("For `int[] a = new int[3];` what are the valid indexes?", ["0, 1, 2", "1, 2, 3", "0, 1, 2, 3", "3"], 0, "Three slots, numbered from 0."),
              Q.mc("What happens if you read `a[3]` in that array?", ["An ArrayIndexOutOfBoundsException", "You get 0", "You get null", "It compiles to a warning"], 0, "Java checks the bounds and stops the program."),
              Q.match("Match each String method to what it does.", [["length()", "number of characters"], ["charAt(0)", "the first character"], ["toUpperCase()", "makes capitals"], ["equals(t)", "compares the text"]], "You'll use these constantly on the AP exam."),
            ],
          },
        ],
      },
    ],
  });
})();
