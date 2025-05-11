import { Repository } from "typeorm";
import { ITenant, TenantQueryParams } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }
  async getAll(validatedQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where("CONCAT(tenant.name, ' ', tenant.address) ILike :q", {
        q: searchTerm,
      });
    }

    const result = await queryBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("tenant.id", "DESC")
      .getManyAndCount();
    return result;
  }
  async update(id: number, tenantData: ITenant) {
    return await this.tenantRepository.update(id, tenantData);
  }
  async getTenantById(tenantId: number) {
    return await this.tenantRepository.findOne({ where: { id: tenantId } });
  }
  async deleteTenantById(tenantId: number) {
    return await this.tenantRepository.delete(tenantId);
  }
  async deleteAllTenant() {
    const allTenants = await this.tenantRepository.find();
    const result = await this.tenantRepository.remove(allTenants);
    return result;
  }
}
