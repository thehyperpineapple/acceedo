# humidity-monitor-backend

## Routes

Description of routes and their usage
Base url for testing - `http://localhost:3000/`
| HTTP Method  | Function              | Route                                                   | Description                                                                                     |
| ------------ | --------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `POST`       | External Services     | `/external/createServer`                                | Creates a collection for a particular board in the database with the required parameters        |
| `PUT`        | External Services     | `/external/updateServer`                                | Adds a new entry in the collection with the defined parameters                                  |
| `DELETE`     | External Services     | `/external/deleteServer`                                | Deletes the entire collection for the specified board                                           |
| `POST`       | User Authentication   | `/auth/login`                                           | Authenticates a user and returns a token                                                        |
| `POST`       | User Authentication   | `/auth/createUser`                                      | Creates a new user in the system                                                                |
| `GET`        | User Authentication   | `/auth/viewUsers`                                       | Retrieves a list of all users                                                                   |
| `DELETE`     | User Authentication   | `/auth/deleteUser/:userId`                              | Deletes a specific user by `userId`                                                             |
| `GET`        | Settings              | `/settings/getSettings`                                 | Fetches all settings from the database                                                          |
| `POST`       | Settings              | `/settings/addSettings`                                 | Adds new settings to the database                                                               |                                              |
| `DELETE`     | Settings              | `/settings/deleteSettings/:id`                         | Deletes specific settings by `id`                                                               |
| `GET`        | Report                | `/report/:id?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Generates a report for a specific `unit_ID` with optional date range filters                    |
| `GET`        | Graph                 | `/graph/:id?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`  | Fetches graph data for a specific `unit_ID` with optional date range filters                    |
