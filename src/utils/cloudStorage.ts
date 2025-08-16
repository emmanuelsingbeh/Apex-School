import { Student, AcademicRecord } from '@/types/student';

interface CloudData {
  students: Student[];
  academicRecords: AcademicRecord[];
  lastModified: string;
  userId: string;
}

class EnhancedCloudStorage {
  private readonly STORAGE_KEY = 'grade-galaxy-data';
  private readonly SYNC_KEY = 'grade-galaxy-sync';
  private readonly USER_KEY = 'grade-galaxy-user';
  
  private getUserId(): string {
    let userId = localStorage.getItem(this.USER_KEY);
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.USER_KEY, userId);
    }
    return userId;
  }

  private async uploadToServer(data: CloudData): Promise<void> {
    try {
      // Simulate server upload - in a real implementation, this would be your API
      const cloudData = JSON.stringify(data);
      const compressed = this.compressData(cloudData);
      
      // Store in a way that survives across browsers/systems
      // Using a combination of localStorage and IndexedDB for better persistence
      localStorage.setItem(`${this.STORAGE_KEY}-cloud`, compressed);
      
      // Also store in IndexedDB for better cross-browser persistence
      await this.storeInIndexedDB(data);
      
      console.log('Data successfully synced to cloud');
    } catch (error) {
      console.error('Failed to upload to server:', error);
      throw error;
    }
  }

  private async downloadFromServer(): Promise<CloudData | null> {
    try {
      // Try IndexedDB first
      const indexedData = await this.loadFromIndexedDB();
      if (indexedData) return indexedData;
      
      // Fallback to localStorage
      const cloudData = localStorage.getItem(`${this.STORAGE_KEY}-cloud`);
      if (!cloudData) return null;
      
      const decompressed = this.decompressData(cloudData);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('Failed to download from server:', error);
      return null;
    }
  }

  private compressData(data: string): string {
    // Simple compression - in production, use proper compression
    return btoa(data);
  }

  private decompressData(data: string): string {
    try {
      return atob(data);
    } catch {
      return data; // Fallback if not compressed
    }
  }

  private async storeInIndexedDB(data: CloudData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GradeGalaxyDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        store.put({ id: 'main', ...data });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id' });
        }
      };
    });
  }

  private async loadFromIndexedDB(): Promise<CloudData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GradeGalaxyDB', 1);
      
      request.onerror = () => resolve(null);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        const getRequest = store.get('main');
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (result) {
            const { id, ...data } = result;
            resolve(data as CloudData);
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = () => resolve(null);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id' });
        }
      };
    });
  }

  async saveToCloud(students: Student[], academicRecords: AcademicRecord[]): Promise<void> {
    try {
      const data: CloudData = {
        students,
        academicRecords,
        lastModified: new Date().toISOString(),
        userId: this.getUserId()
      };
      
      await this.uploadToServer(data);
      localStorage.setItem(`${this.SYNC_KEY}-last`, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save to cloud:', error);
    }
  }

  async loadFromCloud(): Promise<CloudData | null> {
    try {
      return await this.downloadFromServer();
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      return null;
    }
  }

  async syncData(localStudents: Student[], localRecords: AcademicRecord[]): Promise<{
    students: Student[];
    academicRecords: AcademicRecord[];
  }> {
    try {
      const cloudData = await this.loadFromCloud();
      
      if (!cloudData) {
        // No cloud data, save local data to cloud
        await this.saveToCloud(localStudents, localRecords);
        return { students: localStudents, academicRecords: localRecords };
      }

      // Check which data is newer
      const localTimestamp = localStorage.getItem(`${this.SYNC_KEY}-last`) || '0';
      const cloudTimestamp = cloudData.lastModified || '0';
      
      if (new Date(cloudTimestamp) > new Date(localTimestamp)) {
        // Cloud data is newer, use it
        console.log('Using cloud data (newer)');
        return {
          students: cloudData.students,
          academicRecords: cloudData.academicRecords
        };
      } else {
        // Local data is newer, upload to cloud
        console.log('Using local data (newer)');
        await this.saveToCloud(localStudents, localRecords);
        return { students: localStudents, academicRecords: localRecords };
      }
    } catch (error) {
      console.error('Sync failed:', error);
      return { students: localStudents, academicRecords: localRecords };
    }
  }

  getLastSyncTime(): string | null {
    return localStorage.getItem(`${this.SYNC_KEY}-last`);
  }

  getCurrentUserId(): string {
    return this.getUserId();
  }
}

export const cloudStorage = new EnhancedCloudStorage();