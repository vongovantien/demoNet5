import { MonoTypeOperatorFunction } from 'rxjs';
import { delay, retryWhen, scan, tap } from 'rxjs/operators';


export function retryWithDelay<T>(
    delayTime: number,
    count = 1
): MonoTypeOperatorFunction<T> {
    return (input) =>
        input.pipe(
            retryWhen((errors) =>
                errors.pipe(
                    scan((acc, error) => ({ count: acc.count + 1, error }), {
                        count: 0,
                        error: undefined as any,
                    }),
                    tap((current) => {
                        if (current.count > count) {
                            throw current.error;
                        }
                    }),
                    delay(delayTime)
                )
            )
        )
}
