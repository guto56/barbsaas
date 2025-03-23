-- Renomear a coluna bio para site_username
ALTER TABLE profiles 
RENAME COLUMN bio TO site_username;

-- Adicionar uma restrição UNIQUE para garantir que usernames sejam únicos
ALTER TABLE profiles
ADD CONSTRAINT unique_site_username UNIQUE (site_username); 