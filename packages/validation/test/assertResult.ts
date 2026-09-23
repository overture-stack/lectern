import { type Failure, type Result, type Success } from '@overture-stack/lectern-dictionary';
import { AssertionError } from 'chai';

export function assertSuccess<TSuccess>(input: Result<TSuccess, unknown>): asserts input is Success<TSuccess> {
	if (!input.success) throw new AssertionError('Result was expected to be a success but was a failure.');
}

export function assertFailure<TFailure>(input: Result<unknown, TFailure>): asserts input is Failure<TFailure> {
	if (input.success) throw new AssertionError('Result was expected to be a failure but was a success.');
}
