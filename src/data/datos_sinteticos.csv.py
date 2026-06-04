import sys, io, csv, random, os
sys.stdout.reconfigure(encoding='utf-8')

# El tamaño de fiulas del archivo está en configuración separado: volumen_config.txt 
ruta_config = os.path.join(os.path.dirname(__file__), "volumen_config.txt")
with open(ruta_config, "r") as f:
    N_FILAS = int(f.read().strip())

ESTADOS = [
    "Aguascalientes", "Baja California", "Campeche", "Chiapas", "Chihuahua",
    "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "Mexico", "Michoacan", "Morelos", "Nayarit", "Nuevo Leon",
    "Oaxaca", "Puebla", "Queretaro", "Quintana Roo", "San Luis Potosi",
    "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
    "Yucatan", "Zacatecas"
]

# Escribir el CSV 
escritor = csv.writer(sys.stdout)
escritor.writerow(["id", "estado", "municipio", "poblacion", "indice_marginacion"])

for i in range(N_FILAS):
    estado = random.choice(ESTADOS)
    municipio = f"Municipio_{i:07d}"
    poblacion = random.randint(500, 2_000_000)
    indice = round(random.uniform(-2.5, 2.5), 4)
    escritor.writerow([i, estado, municipio, poblacion, indice])