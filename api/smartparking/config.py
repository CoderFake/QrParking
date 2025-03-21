from functools import lru_cache, cached_property
import os
from pathlib import Path
from typing import Optional, Union
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from smartparking.ext.firebase.base import FirebaseAuthSettings, FirebaseAdminSettings
from smartparking.ext.storage.base import StorageSettings
from smartparking.ext.otp.base import OTPSetting
from smartparking.ext.AES.base import AESSettings



class ApplicationSettings(BaseSettings):

    class DB(BaseModel):

        dsn: str = Field(description="Destination DSN.")
        pool_size: int = Field(default=20, description="Maximum number of connection pool.")
        echo: bool = Field(default=False, description="Whether to output query logs.")
        echo_pool: bool = Field(default=False, description="Whether to output connection pool related logs.")

    class Static(BaseModel):
        root: str = Field(description="Root directory.")
        path: str = Field(description="URL path.")

    class MQTTSettings(BaseModel):
        broker_url: str = Field(description="MQTT broker URL.")
        broker_port: int = Field(default=1883, description="MQTT broker port.")
        username: Optional[str] = Field(default=None, description="MQTT username.")
        password: Optional[str] = Field(default=None, description="MQTT password.")
        client_id: str = Field(default="fastapi_mqtt_client", description="MQTT client ID.")
        route: Optional[str] = Field(default=None, description="MQTT topic route.")
        base_url: Optional[str] = Field(default=None, description="Base URL for forwarding messages.")

    class DocumentAuth(BaseModel):
        enabled: bool = Field(description="Whether to perform document delivery.")
        username: str = Field(description="Username.")
        password: str = Field(description="Password.")
        url_prefix: str = Field(description="URL prefix.")

    name: str = Field(description="Application name.")
    version: str = Field(description="Application version.")
    errors: Optional[str] = Field(default=None, description="Error message configuration file path.")
    launch_screen: bool = Field(default=False, description="Flag to display launch screen.")
    static: Optional[Static] = Field(default=None)
    db: DB
    docs: DocumentAuth
    aes: AESSettings
    mqtt: MQTTSettings
    storage: StorageSettings
    otp: OTPSetting
    firebase: Union[FirebaseAuthSettings, FirebaseAdminSettings]

    def dump(self) -> str:
        lines = ["[root]"]

        for n, f in self.model_fields.items():
            value = getattr(self, n)

            if isinstance(value, BaseModel):
                lines.append(f"[{n}]")
                for k, v in value.model_dump().items():
                    lines.append(f"{(k + ':'):16}{v}")
            else:
                lines.append(f"{(n + ':'):16}{value}")

        return '\n'.join(lines)


@lru_cache
def root_package() -> str:

    return __name__.split('.')[0]


@lru_cache
def app_env() -> str:

    return f'{root_package().upper()}_ENV'


class Environment:
    def __init__(self, key: str, env_file: str, delimiter: str = '__') -> None:
        self.key = key
        self.env_file = env_file
        self.delimiter = delimiter

    @cached_property
    def settings(self) -> ApplicationSettings:
        local_env = Path(self.env_file).with_suffix(".local")

        return ApplicationSettings(
            _env_file=(self.env_file, local_env),  # type: ignore
            _env_nested_delimiter=self.delimiter,  # type: ignore
        )


@lru_cache
def environment() -> Environment:
    env = os.environ.get(app_env(), 'dev')
    return Environment(env, f'./config/.env.{env}')
