# from pandas.compat._optional import VERSIONS as VERSIONS, import_optional_dependency as import_optional_dependency
from typing import (
    List,
    Optional,
    Tuple,
    Union,
)

def get_sys_info() -> List[Tuple[str, Optional[Union[str, int]]]]: ...
def show_versions(as_json: bool = ...) -> None: ...
def main() -> int: ...
