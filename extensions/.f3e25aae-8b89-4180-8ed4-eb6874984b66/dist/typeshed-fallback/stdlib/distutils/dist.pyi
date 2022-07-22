from _typeshed import StrOrBytesPath, SupportsWrite
from distutils.cmd import Command
from typing import IO, Any, Iterable, Mapping

class DistributionMetadata:
    def __init__(self, path: int | StrOrBytesPath | None = ...) -> None: ...
    name: str | None
    version: str | None
    author: str | None
    author_email: str | None
    maintainer: str | None
    maintainer_email: str | None
    url: str | None
    license: str | None
    description: str | None
    long_description: str | None
    keywords: str | list[str] | None
    platforms: str | list[str] | None
    classifiers: str | list[str] | None
    download_url: str | None
    provides: list[str] | None
    requires: list[str] | None
    obsoletes: list[str] | None
    def read_pkg_file(self, file: IO[str]) -> None: ...
    def write_pkg_info(self, base_dir: str) -> None: ...
    def write_pkg_file(self, file: SupportsWrite[str]) -> None: ...
    def get_name(self) -> str: ...
    def get_version(self) -> str: ...
    def get_fullname(self) -> str: ...
    def get_author(self) -> str: ...
    def get_author_email(self) -> str: ...
    def get_maintainer(self) -> str: ...
    def get_maintainer_email(self) -> str: ...
    def get_contact(self) -> str: ...
    def get_contact_email(self) -> str: ...
    def get_url(self) -> str: ...
    def get_license(self) -> str: ...
    def get_licence(self) -> str: ...
    def get_description(self) -> str: ...
    def get_long_description(self) -> str: ...
    def get_keywords(self) -> str | list[str]: ...
    def get_platforms(self) -> str | list[str]: ...
    def get_classifiers(self) -> str | list[str]: ...
    def get_download_url(self) -> str: ...
    def get_requires(self) -> list[str]: ...
    def set_requires(self, value: Iterable[str]) -> None: ...
    def get_provides(self) -> list[str]: ...
    def set_provides(self, value: Iterable[str]) -> None: ...
    def get_obsoletes(self) -> list[str]: ...
    def set_obsoletes(self, value: Iterable[str]) -> None: ...

class Distribution:
    cmdclass: dict[str, type[Command]]
    metadata: DistributionMetadata
    def __init__(self, attrs: Mapping[str, Any] | None = ...) -> None: ...
    def get_option_dict(self, command: str) -> dict[str, tuple[str, str]]: ...
    def parse_config_files(self, filenames: Iterable[str] | None = ...) -> None: ...
    def get_command_obj(self, command: str, create: bool = ...) -> Command | None: ...
