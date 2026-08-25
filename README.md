# Simulador de Algoritmos de Ordenamiento

Este proyecto es un entorno interactivo y determinista para la visualización y estudio de algoritmos de ordenamiento. Su objetivo es aislar la lógica matemática de la representación visual, garantizando simulaciones exactas, reproducibles y reversibles en cualquier navegador moderno.

## Arquitectura del Proyecto

El sistema está construido bajo un paradigma estricto de separación de responsabilidades y no utiliza librerías externas ni dependencias. Todo el código es JavaScript, HTML y CSS puro.

La arquitectura se divide en cuatro capas aisladas:
1. Algoritmo
2. Motor Central
3. Traza
4. Interfaz de Usuario

Ningún algoritmo tiene acceso directo al Document Object Model ni al estado global. La comunicación se realiza exclusivamente a través de un contexto inyectado que registra intenciones operativas.

## Invariantes del Motor Central

El núcleo del simulador funciona bajo reglas matemáticas inquebrantables. Estas reglas aseguran que el sistema no colapse bajo simulaciones masivas y garantizan un comportamiento predecible.

- Reversibilidad Absoluta: Toda mutación de datos es perfectamente reversible. Aplicar una operación y luego deshacerla retorna el sistema a su estado idéntico anterior.
- Ciclo de Estabilidad: El proceso de avanzar y retroceder en la línea de tiempo no genera divergencias ni corrompe los datos.
- Determinismo: El sistema utiliza un Generador de Números Pseudoaleatorios con semilla estática. Ejecutar una simulación con los mismos parámetros iniciales producirá la misma traza exacta en cualquier dispositivo.
- Aislamiento de Consultas: Las operaciones de lectura y marcado visual jamás alteran los arreglos matemáticos internos.
- Tiempo Pedagógico: Las operaciones lógicas no avanzan la simulación. Solo el cierre explícito de un paso lógico delimita la frontera del tiempo temporal.

## Gestión de Estado y Memoria

El simulador prohíbe el almacenamiento de copias completas de los arreglos en cada paso lógico. En su lugar, el sistema guarda exclusivamente las operaciones matemáticas destructivas y constructivas en formato de deltas. Esto permite procesar simulaciones de gran escala sin saturar la memoria RAM.

El estado interno se divide estrictamente en dos segmentos aislados:
- Estado Matemático: Contiene los datos crudos y es el único sujeto a mutaciones reversibles.
- Estado de Presentación: Contiene metadatos derivados para la visualización. Se reconstruye dinámicamente al viajar en el tiempo.

El renderizador visual jamás accede a la memoria del simulador. Toda la información gráfica se recibe a través de un bus de eventos mediante copias inmutables, bloqueando cualquier mutación accidental desde la interfaz.

## Pruebas de Integridad

El núcleo incluye un sistema de pruebas de caja negra que valida la integridad de cada algoritmo antes de su ejecución visual. El sistema verifica que los algoritmos no alteren la cantidad original de elementos y que el estado final coincida de manera idéntica con los algoritmos nativos de ordenamiento. Cualquier violación a las reglas de acceso o índices fuera de rango detiene la simulación y arroja un error crítico.
