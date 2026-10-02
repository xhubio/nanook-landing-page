# Overview

Source: https://nanook.xhub.io/docs/tutorials/overview

In the first lesson this tutorial will teach you how to create an equivalence class table to define test cases. You will learn how to create such a table and what the benefits of using this method are. The creation of such a table is also called "equivalence partitioning". The pool of possible input values is divided into partitions of values that can be considered to be the same.

For example, if there is a boundary that the user must be of age 18 or older, then the input values 17 and below are grouped into the same class (equivalence class).

In the next lesson you will convert the equivalence class table into a data generation table. With one tool, you are be able to define the test cases and create the test data needed for each test case.

At first glance it may seam a little complicated to use this method. But once you get familiar with it, it is a great way.

When you define the tests with this method you also have a good documentation on which tests you perform and why. It provides the opportunity to optimise test cases, find all test cases needed and avoid duplicates.

Also, you will be able to show your manager what you are doing (sometimes this is a very important factor).

The example repository `tutorial-source` used by this tutorial is archived (last change November 2020) and targets Nanook 1.x. The tutorials below still explain the table concepts, which are unchanged; for 3.x code (TypeScript, ESM, Node.js 22 or newer) follow the tutorials in the repository: [docs/tutorials](https://github.com/xhubio/nanook-table/tree/master/docs/tutorials). Where this tutorial refers to files, they are relative to that archived repository.

---
Index of all docs: https://nanook.xhub.io/llms.txt
