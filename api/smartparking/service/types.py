import enum

class ParkingType(enum.Enum):
    CHECK_IN = 'check_in'
    CHECK_OUT = 'check_out'


class TicketType(enum.IntEnum):
    DAY = 1
    MONTH = 2