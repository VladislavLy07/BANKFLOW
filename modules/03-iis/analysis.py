"""ИИС ЛР1: учебные синтетические данные. Тема требует согласования."""
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import json
ROOT = Path(__file__).resolve().parents[2]
raw = pd.read_csv(ROOT / 'data/requests_raw.csv')
print('Размер:', raw.shape, '\nТипы:', raw.dtypes, '\nПропуски:', raw.isna().sum())
print(raw.describe(include='all').to_string())
df = raw.drop_duplicates().copy()
df['category'] = df['category'].str.strip().str.capitalize()
# Предметное правило: время обработки должно находиться в диапазоне 0..72 ч.
invalid = ~df['hours'].between(0,72) & df['hours'].notna()
df.loc[invalid,'hours'] = float('nan')
median = df['hours'].median()
df['hours'] = df['hours'].fillna(median)
assert df['id'].is_unique and df['hours'].between(0,72).all()
print('После очистки:', df.shape, 'Медиана:', median)
print(df.groupby('category')['hours'].agg(['count','mean','min','max']))
out = ROOT / 'modules/03-iis'
df.to_csv(out/'requests_clean.csv',index=False)
fig, ax = plt.subplots(figsize=(8,4)); df.groupby('category')['hours'].mean().sort_values().plot.barh(ax=ax,color='#e86a24'); ax.set_xlabel('Часы'); ax.set_title('Среднее время по категории'); fig.tight_layout(); fig.savefig(out/'category_hours.png',dpi=150);plt.close(fig)
fig, ax = plt.subplots(figsize=(8,4)); df['hours'].plot.hist(bins=16,ax=ax,color='#153b73'); ax.set_xlabel('Часы'); ax.set_title('Распределение времени');fig.tight_layout();fig.savefig(out/'hours_hist.png',dpi=150);plt.close(fig)
fig, ax = plt.subplots(figsize=(8,4)); df.groupby('status')['hours'].mean().plot.bar(ax=ax,color='#e86a24');ax.set_ylabel('Часы');ax.set_title('Среднее время по статусу');fig.tight_layout();fig.savefig(out/'status_hours.png',dpi=150);plt.close(fig)
