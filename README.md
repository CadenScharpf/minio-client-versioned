<center><h1>Minio Client Versioned (MCV)</h1><center>
<p align="center">
    <a href="https://www.npmjs.com/package/@cscharpf/minio-client-versioned">
        <img src="https://img.shields.io/npm/v/@cscharpf/minio-client-versioned.svg?style=flat&logo=npm" alt="NPM Version">
    </a>
    <center>
        <p >
        MCV is a drop in replacement for the MinIO <a href="https://min.io/docs/minio/linux/reference/minio-mc/mc-mirror.html">mirror</a> CLI with the added benefit of ensuring replication while preserving the order of versioned objects. Utilize MCV for seamless data migration between any S3 or MinIO bucket.
        </p>
    </center>
</p>


## Installation

To install MCV, you need to have Node.js and npm installed. Then, you can install MCV globally using npm:

```bash
npm install -g @cscharpf/minio-client-versioned
```

## Usage

MCV provides commands for mirroring buckets and managing aliases.

### Mirror Command

The `mirror` command is used to mirror objects between source and target buckets.

```bash
mcv mirror [options]
```

#### Options:

- `-b, --bucket [bucket]`: Bucket to mirror.
- `-s, --source [source]`: Source client.
- `-t, --target [target]`: Target client.
- `-c, --clean`: Clean objects in the target bucket that are not in the source bucket.
- `-v, --verbose`: Verbose output.
- `-C, --concurrency`: Number of concurrent object streams (default 100).

### Alias Command

The `alias` command is used to manage aliases for clients.

```bash
mcv alias [add|remove|list] [options]
```

#### Subcommands:

- `add`: Add a new alias.
- `remove`: Remove an existing alias.
- `list`: List all aliases.

#### Options:

- `-n, --name`: Alias name.
- `-e, --endpoint`: Endpoint.
- `-p, --port`: Port.
- `--use-ssl`: Use SSL.
- `--access-key`: Access key.
- `--secret-key`: Secret key.

## Examples

### Mirror a Bucket

```bash
mcv mirror -b my-bucket -s source-client -t target-client
```

### Add Alias

```bash
mcv alias add -n my-alias -e example.com -p 9000 --use-ssl --access-key my-access-key --secret-key my-secret-key
```

### Remove Alias

```bash
mcv alias remove -n my-alias
```

### List Aliases

```bash
mcv alias list
```

## Contributing

If you have suggestions or found bugs, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
