import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MinLessThanMax', async: false })
export class MinLessThanMaxValidator implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as any;
    const min = object['minPrice'];
    const max = object['maxPrice'];
    return min === undefined || max === undefined || min <= max;
  }

  defaultMessage(args: ValidationArguments) {
    return 'minPrice must be less than or equal to maxPrice';
  }
}
