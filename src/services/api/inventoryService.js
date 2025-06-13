import inventoryData from '../mockData/inventory.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class InventoryService {
  constructor() {
    this.data = [...inventoryData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(item => item.id === id);
    if (!item) {
      throw new Error('Item not found');
    }
    return { ...item };
  }

  async create(itemData) {
    await delay(400);
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    this.data.unshift(newItem);
    return { ...newItem };
  }

  async update(id, updateData) {
    await delay(350);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    const updatedItem = {
      ...this.data[index],
      ...updateData,
      id,
      lastUpdated: new Date().toISOString()
    };
    
    this.data[index] = updatedItem;
    return { ...updatedItem };
  }

  async delete(id) {
    await delay(300);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async getLowStock() {
    await delay(250);
    return this.data.filter(item => item.quantity <= item.minStock);
  }

  async getByCategory(category) {
    await delay(250);
    return this.data.filter(item => item.category === category);
  }
}
const inventoryService = new InventoryService();
export { inventoryService };
export default inventoryService;