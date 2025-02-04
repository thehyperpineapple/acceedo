import time
import random
import json
import multiprocessing
from websockets.sync.client import connect


def send_data(board_id):
    """Establish a persistent WebSocket connection and continuously send data."""
    ws_url = f"ws://localhost:8000/websocket/{board_id}"

    try:
        with connect(ws_url) as websocket:
            while True:
                data = {
                    "unit_ID": board_id,
                    "t": random.randint(25, 40),
                    "h": random.randint(50, 70),
                    "w": random.randint(45, 80),
                    "eb": random.randint(10, 90),
                    "ups": 1,
                    "x": 10,
                    "y": 20,
                }
                websocket.send(json.dumps(data))
                response = websocket.recv()
                print(f"Board {board_id} Response: {response}")
                time.sleep(1)
    except Exception as e:
        print(f"Error with board {board_id}: {e}")


if __name__ == "__main__":
    board_list = [2, 3, 4, 5]
    processes = []

    for board_id in board_list:
        p = multiprocessing.Process(target=send_data, args=(board_id,))
        p.start()
        processes.append(p)

    # Ensure all processes run indefinitely
    for p in processes:
        p.join()
