import requestData from '../mockData/requests.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class RequestService {
  constructor() {
    this.data = [...requestData];
  }

  async getAll() {
    await delay(300);
    return [...this.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getById(id) {
    await delay(200);
    const request = this.data.find(req => req.id === id);
    if (!request) {
      throw new Error('Request not found');
    }
    return { ...request };
  }

  async create(requestData) {
    await delay(400);
    const newRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.unshift(newRequest);
    return { ...newRequest };
  }

  async update(id, updateData) {
    await delay(350);
    const index = this.data.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Request not found');
    }
    
    const updatedRequest = {
      ...this.data[index],
      ...updateData,
      id
    };
    
    this.data[index] = updatedRequest;
    return { ...updatedRequest };
  }

  async delete(id) {
    await delay(300);
    const index = this.data.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Request not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async getByStatus(status) {
    await delay(250);
    return this.data.filter(req => req.status === status);
  }

  async getByUser(userId) {
    await delay(250);
    return this.data.filter(req => req.requestedBy === userId);
  }
}

export default new RequestService();