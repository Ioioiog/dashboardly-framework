export * from './auth-types';
export * from './maintenance-types';
export * from './property-types';
export * from './tenant-types';
export * from './payment-types';
export * from './utility-types';

export type Database = {
  public: AuthSchema['Tables'] &
    MaintenanceSchema['Tables'] &
    PropertySchema['Tables'] &
    TenantSchema['Tables'] &
    PaymentSchema['Tables'] &
    UtilitySchema['Tables'];
};