# Writer

Source: https://nanook.xhub.io/docs/modules/writer

The writer is responsible for exporting the generated data in the required format. It is best practice to create one writer for each format or type.

## Constructor

**constructor of a writer.**

```
constructor(opts = {}) {
    this.logger = opts.logger || getLoggerMemory()
}
```

The constructor will get the logger. So to write any logs you could use:

```
this.logger.info('My important info')
```

## before

This method is called when the processor start working on the test cases. This is meant for set up the writer.

```
async before() {
    console.log(`Start a new processing`)
}
```

## after

This method is called when the processor has finished all the test cases. This is meant for tear down the writer.

```
async after() {
    console.log(`End processing`)
}
```

## write

This is the method doing the work. It will be called for each test case. It will get the test case data object which contains all the data generated for one test case.

It is up to the writer to extract the needed.

```
async write(testcaseData) {
    console.log(
        `Write testcase '${testcaseData.name}' for table '${
            testcaseData.tableName
        }'`
    )
}
```

---
Index of all docs: https://nanook.xhub.io/llms.txt
