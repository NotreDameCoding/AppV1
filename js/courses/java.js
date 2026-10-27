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
      {
        title: "More about data", blurb: "Text methods, math and casting.",
        lessons: [
          {
            id: "jv-7", title: "String methods", blurb: "Measure, slice and compare text.",
            intro: { text: "A Java `String` is an object with methods. `length()` counts characters, `charAt(i)` reads one character, `substring(a, b)` takes the part from a up to (not including) b, and `toUpperCase()` changes the case. To compare text, use `equals`, never `==`.", code: 'String s = "knight";\nSystem.out.println(s.length());\nSystem.out.println(s.charAt(0));\nSystem.out.println(s.substring(1, 3));\nSystem.out.println(s.equals("knight"));' },
            ex: [
              Q.mc("What does this print?", ["6", "5", "7", "An error"], 0, "`length()` counts every character in \"knight\".", 'String s = "knight";\nSystem.out.println(s.length());'),
              Q.mc("What does `\"Hello\".charAt(1)` give?", ["e", "H", "l", "o"], 0, "Counting starts at 0, so index 1 is the second letter."),
              Q.fill("Compare two strings the right way.", "if (a.___(b)) {\n    System.out.println(\"same\");\n}", ["equals", "==", "compare", "same"], "equals", "`==` compares references. `equals` compares the text itself."),
              Q.mc("What does `\"Java\".substring(1, 3)` give?", ["av", "Jav", "ava", "va"], 0, "It takes indexes 1 and 2 and stops before 3."),
              Q.type("What does `\"ab\" + \"cd\"` produce?", "abcd", "`+` joins strings together."),
              Q.match("Match each String method to its job.", [[".length()", "counts the characters"], [".toUpperCase()", "makes every letter a capital"], [".equals(x)", "compares the text"], [".charAt(0)", "reads the first character"]], "These four cover most text work."),
            ],
          },
          {
            id: "jv-8", title: "Math and casting", blurb: "Whole-number division, remainders and conversions.",
            intro: { text: "Dividing two `int` values gives an `int`, so `7 / 2` is 3 and the decimal part is dropped. `%` gives the remainder: `7 % 2` is 1. To keep decimals, cast one side to `double`. The `Math` class has `Math.max`, `Math.min`, `Math.pow` and `Math.sqrt`.", code: "System.out.println(7 / 2);\nSystem.out.println(7 % 2);\nSystem.out.println((double) 7 / 2);\nSystem.out.println(Math.max(4, 9));" },
            ex: [
              Q.mc("What does `System.out.println(7 / 2);` print?", ["3", "3.5", "4", "2"], 0, "Both numbers are ints, so Java drops the decimal part."),
              Q.mc("What does `10 % 4` give?", ["2", "2.5", "6", "0"], 0, "10 divided by 4 is 2 with 2 left over."),
              Q.fill("Cast so the division keeps its decimals.", "double r = (___) 7 / 2;", ["double", "int", "long", "char"], "double", "A `double` cast makes the division produce 3.5."),
              Q.mc("What does `Math.pow(2, 3)` print?", ["8.0", "8", "6", "9"], 0, "`Math.pow` returns a `double`, so it prints 8.0."),
              Q.type("What does `Math.max(4, 9)` give?", "9", "`Math.max` returns the larger of the two."),
              Q.order("Order the lines to print the average 2.5 of two ints.", ["int a = 10;", "int b = 4;", "double r = (double) a / b;", "System.out.println(r);"], "Declare both numbers, divide with a cast, then print."),
            ],
          },
        ],
      },
      {
        title: "Loops and lists", blurb: "Repeat with while, and hold a growing list.",
        lessons: [
          {
            id: "jv-9", title: "while and nested loops", blurb: "Repeat until something changes.",
            intro: { text: "A `while` loop repeats as long as its condition is true, so something inside it must change or it never ends. A loop inside another loop runs completely for each turn of the outer loop. `break` leaves a loop early and `continue` skips to the next turn.", code: "int i = 1;\nwhile (i <= 3) {\n    System.out.println(i);\n    i++;\n}" },
            ex: [
              Q.mc("What does this print?", ["1, 2, 3 on separate lines", "1, 2", "0, 1, 2", "Nothing"], 0, "`i` starts at 1 and the loop stops once `i` passes 3.", "int i = 1;\nwhile (i <= 3) {\n    System.out.println(i);\n    i++;\n}"),
              Q.mc("What happens if you forget `i++` in a `while (i <= 3)` loop?", ["It loops forever", "It runs once", "It doesn't run", "A compile error"], 0, "The condition never becomes false."),
              Q.fill("Keep looping while i is less than 5.", "while (i ___ 5) {\n    i++;\n}", ["<", "<=", ">", "=="], "<", "Use `<` so the loop stops at 5."),
              Q.mc("How many stars does this print?", ["6", "5", "3", "2"], 0, "The inner loop runs 2 times for each of the 3 outer turns.", "for (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 2; j++) {\n        System.out.println(\"*\");\n    }\n}"),
              Q.order("Order the lines to count down 5 to 1.", ["int n = 5;", "while (n > 0) {", "    System.out.println(n);", "    n--;", "}"], "Set up the variable, loop while it's positive, print, then shrink it."),
              Q.match("Match each word to what it does.", [["while", "repeats while a condition is true"], ["for", "a counter loop on one line"], ["break", "leaves the loop early"], ["continue", "skips to the next turn"]], "Four loop tools you'll use all the time."),
            ],
          },
          {
            id: "jv-10", title: "ArrayList", blurb: "A list that grows and shrinks.",
            intro: { text: "An array has a fixed size. An `ArrayList` can grow. Import it first with `import java.util.ArrayList;`. Create one with the type in angle brackets, then use `add`, `get(i)`, `size()` and `remove(i)`.", code: 'import java.util.ArrayList;\n\nArrayList<String> names = new ArrayList<>();\nnames.add("Ana");\nnames.add("Bo");\nSystem.out.println(names.get(0));\nSystem.out.println(names.size());' },
            ex: [
              Q.mc("Which line creates an empty list of Strings?", ["ArrayList<String> names = new ArrayList<>();", "ArrayList names = [];", "String[] names = new ArrayList();", "List names = new String();"], 0, "The type goes in angle brackets, and `new ArrayList<>()` builds it."),
              Q.mc("What does this print?", ["2", "1", "0", "ab"], 0, "Two items were added.", 'list.add("a");\nlist.add("b");\nSystem.out.println(list.size());'),
              Q.fill("Read the first item.", "System.out.println(list.___(0));", ["get", "at", "index", "read"], "get", "`get(0)` reads the first item."),
              Q.mc("What does `list.remove(0)` do?", ["Deletes the first item", "Deletes the last item", "Empties the list", "Nothing"], 0, "It removes the item at index 0."),
              Q.type("Which method tells you how many items an ArrayList holds?", ["size", "size()"], "Arrays use `.length`, but an ArrayList uses `size()`."),
              Q.match("Match each ArrayList method to its job.", [[".add(x)", "adds to the end"], [".get(i)", "reads item i"], [".size()", "counts the items"], [".remove(i)", "deletes item i"]], "The four you'll use most."),
            ],
          },
        ],
      },
      {
        title: "Objects", blurb: "Build your own types with classes.",
        lessons: [
          {
            id: "jv-11", title: "Classes and objects", blurb: "Blueprints and the things built from them.",
            intro: { text: "A class is a blueprint. An object is one thing built from it with `new`. A class can hold fields (variables that belong to each object) and methods (actions an object can do). You reach them with a dot.", code: 'public class Dog {\n    String name;\n    void bark() {\n        System.out.println("Woof");\n    }\n}\n\nDog d = new Dog();\nd.name = "Rex";\nd.bark();' },
            ex: [
              Q.mc("What is a class?", ["A blueprint for objects", "A kind of loop", "A number type", "A comment"], 0, "A class describes what its objects have and can do."),
              Q.fill("Create a Dog object.", "Dog d = ___ Dog();", ["new", "make", "create", "object"], "new", "`new` builds a fresh object from the class."),
              Q.mc("What does this print?", ["Rex", "name", "d", "null"], 0, "The field `name` was set to \"Rex\" on this object.", 'Dog d = new Dog();\nd.name = "Rex";\nSystem.out.println(d.name);'),
              Q.mc("Which call makes the dog bark?", ["d.bark();", "bark(d);", "Dog.bark;", "d->bark();"], 0, "You call a method with a dot and parentheses."),
              Q.order("Order the lines to build a Dog class with a bark method.", ["public class Dog {", "    String name;", "    void bark() {", "        System.out.println(\"Woof\");", "    }", "}"], "Fields and methods live between the class braces."),
              Q.match("Match each word to its meaning.", [["class", "a blueprint"], ["object", "one thing made from a class"], ["field", "a variable inside an object"], ["method", "an action an object can do"]], "The four core ideas of object-oriented code."),
            ],
          },
          {
            id: "jv-12", title: "Constructors and private data", blurb: "Set up objects, and protect their fields.",
            intro: { text: "A constructor runs when an object is created. It has the same name as the class and no return type. Inside it, `this` means the object being built. Mark fields `private` so only the class can touch them, and give outsiders getter and setter methods.", code: "public class Dog {\n    private String name;\n\n    public Dog(String name) {\n        this.name = name;\n    }\n\n    public String getName() {\n        return name;\n    }\n}" },
            ex: [
              Q.mc("What is a constructor?", ["A method that runs when an object is created", "A loop", "A kind of variable", "A comment"], 0, "It sets the new object up."),
              Q.fill("Store the parameter in the field.", "public Dog(String n) {\n    ___ = n;\n}", ["this.name", "name.this", "Dog.name", "self.name"], "this.name", "`this.name` is the field of the object being built."),
              Q.mc("Why make a field `private`?", ["So only the class can change it directly", "To make it faster", "To make it print", "It is required"], 0, "Private data is protected. Other code must go through methods."),
              Q.mc("Which method is a typical getter for a private field `name`?", ["getName()", "name.get", "readName", "private name()"], 0, "By convention a getter is `get` plus the field name."),
              Q.type("Which keyword refers to the current object?", "this", "Inside a method or constructor, `this` is the object itself."),
              Q.order("Order the lines to write a constructor.", ["public Dog(String name) {", "    this.name = name;", "}"], "Signature first, then the body, then the closing brace."),
            ],
          },
        ],
      },
    ],
  });
})();
