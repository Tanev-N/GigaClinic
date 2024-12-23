import bcrypt

def generate_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

if __name__ == '__main__':
    password = input('Enter password to hash: ')
    print(f'Hash: {generate_hash(password)}') 