const {start} = require("./processTransportUtils");

describe("Transport: NodeJs process", function () {
    it("Should allow for two way communication", async function () {
        const fooSpy = jest.fn().mockReturnValue(1);
        const callFooWith = 123;
        const resolvedSpy = jest.fn();

        await start(fooSpy, callFooWith, resolvedSpy);

        expect(fooSpy).toHaveBeenCalledWith(123);
        expect(resolvedSpy).toHaveBeenCalledWith(1);
    })
})