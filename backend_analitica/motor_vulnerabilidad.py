#Importaciones de librerias
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
import psycopg2
from psycopg2.extras import execute_values
import warnings

warnings.filterwarnings('ignore')
#Confirguración conexión a Supabase(PostgreSQL)
DB_URI = "postgresql://postgres.rbldfilrlaslncwwodxn:System_Vecinal123@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

def analizar_vulnerabilidad():
    print("Iniciando análisis de emergencias...")

    try:
        conn = psycopg2.connect(DB_URI)
        cursor = conn.cursor()

        # 1. Extracción de datos limpia
        query_extraccion = """
            SELECT id, tipo_emergencia, gravedad,
                   ST_Y(ubicacion::geometry) AS lat,
                   ST_X(ubicacion::geometry) AS lon
            FROM alertas_emergencia;
        """

        cursor.execute(query_extraccion)
        registros = cursor.fetchall()

        # Si no hay datos, cerramos todo de forma segura
        if not registros:
            print("No hay alertas de emergencia para procesar.")
            cursor.close()
            conn.close()
            return

        # Convertimos los datos nativos a un DataFrame de Pandas
        columnas = [desc[0] for desc in cursor.description]
        df = pd.DataFrame(registros, columns=columnas)

        # 2. Procesamiento y Clustering (DBSCAN)
        # Convertimos lat/lon a radianes para la métrica haversine
        coords = np.radians(df[['lat', 'lon']])

        # eps = 500 metros (0.5 km) / radio de la Tierra (6371.0 km)
        kms_per_radian = 6371.0
        epsilon = 0.5 / kms_per_radian

        db = DBSCAN(eps=epsilon, min_samples=3, algorithm='ball_tree', metric='haversine').fit(coords)
        df['cluster'] = db.labels_

        # Filtramos el ruido (clústeres con valor -1)
        df_clusters = df[df['cluster'] != -1]

        if df_clusters.empty:
            print("No se encontraron zonas críticas de alta densidad (mínimo 3 reportes cercanos).")
            cursor.close()
            conn.close()
            return

        # 3. Generación de Insights
        zonas_criticas = []

        for cluster_id, grupo in df_clusters.groupby('cluster'):
            centro_lat = grupo['lat'].mean()
            centro_lon = grupo['lon'].mean()
            cantidad = len(grupo)

            gravedad_zona = "ALTA" if cantidad > 5 else "MEDIA"

            zonas_criticas.append((
                f"SRID=4326;POINT({centro_lon} {centro_lat})", # Formato WKT exacto para PostGIS
                500.0,
                cantidad,
                gravedad_zona
            ))

        # 4. Inyección en Supabase
        cursor.execute("TRUNCATE TABLE cluster_vulnerabilidad;")

        query_insercion = """
            INSERT INTO cluster_vulnerabilidad (centroide, radio_metros, cantidad_reportes, nivel_gravedad)
            VALUES %s
        """
        execute_values(cursor, query_insercion, zonas_criticas)
        conn.commit()

        print(f"Éxito: {len(zonas_criticas)} zonas de vulnerabilidad identificadas e inyectadas.")

    except Exception as e:
        print(f"Error durante el análisis: {e}")
    finally:
        # Aseguramos que la conexión siempre se cierre, incluso si hay errores
        if 'cursor' in locals() and cursor is not None:
            cursor.close()
        if 'conn' in locals() and conn is not None:
            conn.close()

if __name__ == "__main__":
    analizar_vulnerabilidad()
