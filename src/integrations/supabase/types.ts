import { AuthSchema } from './database-types/auth';
import { DocumentSchema } from './database-types/document';
import { MaintenanceSchema } from './database-types/maintenance';
import { PaymentSchema } from './database-types/payment';
import { ProfileSchema } from './database-types/profile';
import { PropertySchema } from './database-types/property';
import { TenantSchema } from './database-types/tenant';
import { UtilitySchema } from './database-types/utility';

export type Database = {
  public: PropertySchema['Tables'] &
    TenantSchema['Tables'] &
    ProfileSchema['Tables'] &
    MaintenanceSchema['Tables'] &
    PaymentSchema['Tables'] &
    DocumentSchema['Tables'] &
    UtilitySchema['Tables'];
  auth: AuthSchema;
};

export type { Json } from './database-types/json';