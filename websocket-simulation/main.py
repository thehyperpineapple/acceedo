import time, random, json
from websockets.sync.client import connect
import multiprocessing

def send_data(board_id):
    with connect(f"ws://localhost:800{board_id}") as websocket:
        data = {
            "unit_ID": board_id,
            "t": random.randint(25, 40),
            "h": random.randint(50, 70),
            "w": random.randint(45,80),
            "eb": random.randint(10, 90),
            "ups": 1,
            "x": 10,
            "y": 20
        }
        websocket.send(json.dumps(data,indent=4))
        response = websocket.recv()
        print(f"Response: {response}")

if __name__ == '__main__':
    pool = multiprocessing.Pool(processes=4)

    board_list = [2,3,4,5]
    while True:
        pool.map(send_data, board_list)
        time.sleep(1)
