import userData from '../mockData/users.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class UserService {
  constructor() {
    this.data = [...userData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const user = this.data.find(user => user.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return { ...user };
  }

  async create(userData) {
    await delay(400);
    const newUser = {
      ...userData,
      id: Date.now().toString()
    };
    this.data.push(newUser);
    return { ...newUser };
  }

  async update(id, updateData) {
    await delay(350);
    const index = this.data.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...this.data[index],
      ...updateData,
      id
    };
    
    this.data[index] = updatedUser;
    return { ...updatedUser };
  }

async delete(id) {
    await delay(300);
    const index = this.data.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }
}

const userService = new UserService();
export { userService };
export default userService;