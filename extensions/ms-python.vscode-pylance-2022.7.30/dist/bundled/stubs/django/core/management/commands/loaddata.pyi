import zipfile
from typing import List, Optional, Sequence, Set, Tuple, Type

from django.apps.config import AppConfig
from django.core.management.base import BaseCommand
from django.db.models.base import Model

READ_STDIN: str = ...

class Command(BaseCommand):
    ignore: bool = ...
    using: str = ...
    app_label: str = ...
    verbosity: int = ...
    excluded_models: Set[Type[Model]] = ...
    excluded_apps: Set[AppConfig] = ...
    format: str = ...
    missing_args_message: str = ...
    def loaddata(self, fixture_labels: Sequence[str]) -> None: ...
    def load_label(self, fixture_label: str) -> None: ...
    def find_fixtures(self, fixture_label: str) -> List[Tuple[str, Optional[str], Optional[str]]]: ...
    @property
    def fixture_dirs(self) -> List[str]: ...
    def parse_name(self, fixture_name: str) -> Tuple[str, Optional[str], Optional[str]]: ...

class SingleZipReader(zipfile.ZipFile):
    # Incompatible override
    #     zipfile.ZipFile.read(
    #         self,
    #         name: typing.Union[typing.Text, zipfile.ZipInfo],
    #         pwd: Optional[bytes] = ...,
    #     ) -> bytes: ...
    def read(self) -> bytes: ...  # type: ignore[override]

def humanize(dirname: str) -> str: ...
