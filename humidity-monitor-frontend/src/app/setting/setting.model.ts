// server.model.ts
export interface Server {
    _id: string; // Include this if needed, since it's part of the response
    unit_ID: number;
    humidity_high: number;
    humidity_low: number;
    temp_high: number;
    temp_low: number;
    water_level_high: number;
    water_level_low: number;
  }
  
  export interface ServerResponse {
    settings: Server[]; // This represents the array of servers
  }
  