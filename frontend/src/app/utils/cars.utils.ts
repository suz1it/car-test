import { Car } from '../models/car.model';

export type CarsSortColumn = 'id' | 'make' | 'model' | 'registrationNumber' | 'registrationExpiryDate';
export type CarsSortDirection = 'asc' | 'desc';

/**
 * Filters cars by make (case-insensitive, partial match).
 */
export function filterCarsByMake(cars: Car[], makeFilter: string): Car[] {
  const make = makeFilter.trim().toLowerCase();
  if (!make) return cars;
  return cars.filter((car) => car.make.toLowerCase().includes(make));
}

/**
 * Sorts cars by the given column and direction.
 */
export function sortCars(
  cars: Car[],
  column: CarsSortColumn,
  direction: CarsSortDirection
): Car[] {
  return [...cars].sort((a, b) => {
    let cmp = 0;
    if (column === 'id') cmp = a.id - b.id;
    else if (column === 'make') cmp = a.make.localeCompare(b.make);
    else if (column === 'model') cmp = a.model.localeCompare(b.model);
    else if (column === 'registrationNumber') cmp = a.registrationNumber.localeCompare(b.registrationNumber);
    else if (column === 'registrationExpiryDate') {
      cmp = new Date(a.registrationExpiryDate).getTime() - new Date(b.registrationExpiryDate).getTime();
    }
    return direction === 'asc' ? cmp : -cmp;
  });
}

/**
 * Filters and sorts cars. Pure function combining filter and sort.
 */
export function filterAndSortCars(
  cars: Car[],
  makeFilter: string,
  sortColumn: CarsSortColumn,
  sortDirection: CarsSortDirection
): Car[] {
  const filtered = filterCarsByMake(cars, makeFilter);
  return sortCars(filtered, sortColumn, sortDirection);
}
