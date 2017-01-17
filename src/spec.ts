let requirePreventingTs2339AboutNonExistingContext: any = require;
let testContext: any = requirePreventingTs2339AboutNonExistingContext.context('./', true, /\.spec\.ts/);

testContext.keys().map(testContext);
