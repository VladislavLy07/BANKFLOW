"""Дополнительная демонстрация; ТЗ ВМИП не установлено."""
def deposit(principal, annual_pct, months):
    if principal < 0 or annual_pct < 0 or months < 0: raise ValueError('Неверные параметры')
    return round(principal * (1 + annual_pct / 1200) ** months, 2)
if __name__ == '__main__':
    print(deposit(100000, 12, 12))
