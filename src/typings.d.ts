type ResolveValue = any;
type ResolveHandler = (value?: ResolveValue) => ResolveValue;

type RejectValue = any;
type RejectHandler = (value?: RejectValue) => ResolveValue;

declare enum PromiseStates {
  Pending = 0,
  Fulfilled = 1,
  Rejected = 2
}

type FinalPromiseState = PromiseStates.Rejected | PromiseStates.Fulfilled;

type Thenable = {
  then(
    onResolve?: ResolveHandler,
    onReject?: RejectHandler
  ): Thenable
}
