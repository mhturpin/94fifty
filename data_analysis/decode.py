# get command line arguments
def prompt_user():
    data_str = input('Please enter data\n').replace(':', '')
    return data_str


# process the data string
def process_dribble_response_data(data):
    format = [('start byte', 1), ('TYPE', 2), ('token', 2),
              ('unknown short', 2), ('isLastNotification', 2),
              ('activityId', 4), ('recordId', 2), ('unknown short', 2),
              ('sampleCountToFirstDribble', 4), ('sampleCountToLastDribble', 4),
              ('sampleCountToBufferEnd', 4), ('sampleCountInControl', 4),
              ('totalDribbles', 4), ('maxConsecutiveDribbles', 2),
              ('currentConsecutiveDribbles', 2),
              ('averageConsecutiveDribbles', 2), ('averageDribbleSpeed', 2),
              ('dribbleIntensityMovingAverage', 2),
              ('dribbleIntensityActivityAverage', 2),
              ('dribbleRestartCount', 2), ('unknown short', 2),
              ('Crc32 checksum', 4), ('stop byte', 1)]
    curr_byte = 0
    for section in format:
        end = curr_byte + section[1]*2
        hex_str = data[curr_byte:end]
        print(section[0] + ': 0x' + hex_str + ' (' + str(int(hex_str, 16)) + ')')
        curr_byte += section[1]*2


data = prompt_user()
process_dribble_response_data(data)
