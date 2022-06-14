import { DateAgoPipe } from "@pipes";

fdescribe('DateAgoPipe', () => {
    it('create an instance', () => {
        const pipe = new DateAgoPipe();
        expect(pipe).toBeTruthy();
    });

    it('should display in phone format', () => {
        const phoneNumber = new Date();

        const pipe = new DateAgoPipe();

        const result = pipe.transform(phoneNumber);

        expect(result).toBe('');

    });
});
