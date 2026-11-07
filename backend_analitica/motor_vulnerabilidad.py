"""
Motor de Cálculo de Vulnerabilidad Comunitaria - Edificio Roble
Calcula el índice de prioridad de rescate y auxilio en tiempo real
para Conserjería, Bomberos y Protección Civil.
"""

from typing import Dict, List, Any
from datetime import datetime, timezone

class MotorVulnerabilidad:
    def __init__(self):
        # Factores de ponderación
        self.PESO_ADULTO_MAYOR = 40.0
        self.PESO_MOVILIDAD_REDUCIDA = 30.0
        self.PESO_PISO_SIN_ASCENSOR = 5.0  # Multiplicador por piso
        self.PESO_ELECTRODEPENDIENTE = 50.0

    def calcular_indice_departamento(
        self,
        departamento: str,
        piso: int,
        tiene_adulto_mayor: bool,
        tiene_movilidad_reducida: bool,
        es_electrodependiente: bool = False,
        ascensor_operativo: bool = True
    ) -> Dict[str, Any]:
        """
        Calcula el score de vulnerabilidad de un departamento de 0 a 100.
        """
        score = 0.0
        factores_riesgo = []

        if tiene_adulto_mayor:
            score += self.PESO_ADULTO_MAYOR
            factores_riesgo.append("Adulto mayor en el hogar")

        if tiene_movilidad_reducida:
            score += self.PESO_MOVILIDAD_REDUCIDA
            factores_riesgo.append("Movilidad reducida / silla de ruedas")

        if es_electrodependiente:
            score += self.PESO_ELECTRODEPENDIENTE
            factores_riesgo.append("Dependiente de equipos médicos / electricidad")

        # Si el ascensor falla o hay sismo/incendio, los pisos altos tienen mayor dificultad de evacuación
        if not ascensor_operativo and piso > 1:
            penalizacion_piso = (piso - 1) * self.PESO_PISO_SIN_ASCENSOR
            score += penalizacion_piso
            factores_riesgo.append(f"Piso {piso} sin acceso a ascensor (+{penalizacion_piso} pts)")

        # Normalizar a un rango máximo de 100
        score_final = min(100.0, round(score, 1))

        # Determinar nivel de prioridad
        if score_final >= 70.0:
            nivel = "CRÍTICO / PRIORIDAD 1"
            color = "ROJO"
        elif score_final >= 40.0:
            nivel = "ALTO / PRIORIDAD 2"
            color = "AMARILLO"
        else:
            nivel = "ESTÁNDAR / PRIORIDAD 3"
            color = "VERDE"

        return {
            "departamento": departamento,
            "piso": piso,
            "score_vulnerabilidad": score_final,
            "nivel_prioridad": nivel,
            "color_semaforo": color,
            "factores_riesgo": factores_riesgo,
            "actualizado_en": datetime.now(timezone.utc).isoformat()
        }

    def generar_hoja_ruta_rescate(
        self,
        departamentos: List[Dict[str, Any]],
        ascensor_operativo: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Ordena la lista de departamentos de mayor a menor vulnerabilidad
        para que los bomberos y conserjería atiendan primero a quienes más lo necesitan.
        """
        resultados = []
        for depto in departamentos:
            calculo = self.calcular_indice_departamento(
                departamento=depto.get("departamento", "N/A"),
                piso=depto.get("piso", 1),
                tiene_adulto_mayor=depto.get("tiene_adulto_mayor", False),
                tiene_movilidad_reducida=depto.get("tiene_movilidad_reducida", False),
                es_electrodependiente=depto.get("es_electrodependiente", False),
                ascensor_operativo=ascensor_operativo
            )
            resultados.append(calculo)

        # Ordenar descendente por score
        return sorted(resultados, key=lambda x: x["score_vulnerabilidad"], reverse=True)


if __name__ == "__main__":
    motor = MotorVulnerabilidad()
    
    # Simulación comunitaria Edificio Roble (Portal B)
    censo_comunidad = [
        {
            "departamento": "Dpto 4ºA (Carlos Mendoza)",
            "piso": 4,
            "tiene_adulto_mayor": True,
            "tiene_movilidad_reducida": True,
            "es_electrodependiente": False
        },
        {
            "departamento": "Dpto 302 (Doña Rosa)",
            "piso": 3,
            "tiene_adulto_mayor": True,
            "tiene_movilidad_reducida": False,
            "es_electrodependiente": False
        },
        {
            "departamento": "Dpto 104 (Jorge L.)",
            "piso": 1,
            "tiene_adulto_mayor": False,
            "tiene_movilidad_reducida": False,
            "es_electrodependiente": False
        }
    ]

    print("--- SIMULACIÓN DE PROTOCOLO DE CRISIS (ASCENSOR INOPERATIVO) ---")
    hoja_ruta = motor.generar_hoja_ruta_rescate(censo_comunidad, ascensor_operativo=False)
    for idx, item in enumerate(hoja_ruta, 1):
        print(f"#{idx} [{item['color_semaforo']}] {item['departamento']} - Score: {item['score_vulnerabilidad']}/100 - {item['nivel_prioridad']}")
        for factor in item['factores_riesgo']:
            print(f"    • {factor}")
