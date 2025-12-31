import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestRegressor
import arabic_reshaper
from bidi.algorithm import get_display
from wordcloud import WordCloud
import matplotlib.pyplot as plt
# --- 1. CONFIG & STYLING ---
st.set_page_config(page_title="علموص یار - نسخه نهایی", layout="wide")

st.markdown("""
    <style>
    @import url('https://v1.fontapi.ir/css/Vazir');
    * { font-family: 'Vazir', sans-serif; text-align: right; }
    .main { direction: rtl; }
    div[data-testid="stMetricValue"] { text-align: center; color: #1f77b4; }
    .stSlider { direction: ltr; }
    </style>
    """, unsafe_allow_html=True)

# --- 2. DATA PIPELINE ---
@st.cache_data
def load_data():
    df = pd.read_csv('reviews_sentiment_analysis.csv')
    rating_cols = ['rating_1', 'rating_2', 'rating_3', 'rating_4', 'rating_5', 'rating_6']
    df[rating_cols] = df[rating_cols].apply(pd.to_numeric, errors='coerce').fillna(df[rating_cols].mean())
    sent_map = {'positive': 1, 'neutral': 0.5, 'negative': 0}
    df['sent_num'] = df['final_sentiment'].map(sent_map)
    return df

df = load_data()

# --- 3. ML & ANALYTIC ENGINES ---
def run_clustering(data):
    features = data.groupby('professor_name_standard').agg({
        'rating_1': 'mean', 'rating_3': 'mean', 'sent_num': 'mean'
    })
    scaler = StandardScaler()
    scaled = scaler.fit_transform(features)
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    features['Cluster'] = kmeans.fit_predict(scaled)
    pca = PCA(n_components=2)
    pca_res = pca.fit_transform(scaled)
    features['PCA1'], features['PCA2'] = pca_res[:, 0], pca_res[:, 1]
    cluster_names = {0: "سخت‌گیر (کیفیت بالا)", 1: "محبوب و خوش‌نمره", 2: "معمولی / خنثی"}
    features['Persona'] = features['Cluster'].map(cluster_names)
    return features

# --- 4. NAVIGATION ---
st.sidebar.title("🔍 منوی هوشمند")
menu = st.sidebar.radio("انتخاب کنید:", 
    ["📊 داشبورد آماری", "👤 تحلیل اساتید", "طبقه بندی اساتید","👤 پروفایل استاد","مقایسه اساتید", "📈 روندها و همبستگی","🏆 پیشنهاد دهنده"])

if menu == "📊 داشبورد آماری":
    st.title("📈 وضعیت کلی پایگاه داده علموص یار")
    
    st.markdown("""
        <style>
        [data-testid="stMetricValue"] { text-align: right !important; direction: rtl !important; }
        [data-testid="stMetricLabel"] { text-align: right !important; direction: rtl !important; }
        </style>
    """, unsafe_allow_html=True)

    c1, c2, c3 = st.columns(3)
    with c1:
        st.metric("تعداد کل نظرات", f"{len(df):,}")
    with c2:
        st.metric("تعداد اساتید منحصر به فرد", f"{df['professor_name_standard'].nunique():,}")
    with c3:
        st.metric("میانگین کل رضایت", f"{df['rating_mean'].mean():.2f}")

    st.divider()

    col_left, col_right = st.columns(2)

    with col_right:
        st.subheader("توزیع نظرات در دانشکده‌ها")

        dept_counts = df['department'].value_counts().reset_index()
        dept_counts.columns = ['department_en', 'count']

        dept_counts = dept_counts.head(10)

        fig_dept = px.bar(
            dept_counts,
            x='count',
            y='department_en',
            orientation='h',
            color='count',
            color_continuous_scale='Blues'
        )

        fig_dept.update_layout(
            font=dict(family="Arial", size=14),
            xaxis_title="تعداد",
            yaxis_title="دانشکده",
            
            coloraxis_colorbar=dict(
                title="تعداد"
            )
        )

        st.plotly_chart(fig_dept, use_container_width=True)
    with col_left:
        st.subheader("تحلیل حس کلی دانشگاه")
        
        sent_counts = df['final_sentiment'].value_counts().reset_index()
        sent_counts.columns = ['حس', 'تعداد']
        
        name_map = {'positive': 'مثبت', 'neutral': 'خنثی', 'negative': 'منفی'}
        
        def prepare_labels(text):
            persian_name = name_map.get(text, text)
            return get_display(persian_name)

        sent_counts['label'] = sent_counts['حس'].apply(prepare_labels)

        fig_pie = px.pie(
            sent_counts, 
            values='تعداد', 
            names='label', 
            hole=0.4,
            color='حس', 
            color_discrete_map={'positive':'#2ecc71', 'neutral':'#bdc3c7', 'negative':'#e74c3c'}
        )

        fig_pie.update_layout(
            font=dict(size=16),
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=-0.2,
                xanchor="center",
                x=0.5,
                font=dict(size=14)
            )
        )
        
        st.plotly_chart(fig_pie, use_container_width=True)

    st.subheader("📅 روند مشارکت دانشجویان در ترم‌های مختلف")
    term_trend = df.groupby('term')['rating_mean'].count().reset_index()
    term_trend.columns = ['ترم', 'تعداد نظرات']
    fig_line = px.line(term_trend, x='ترم', y='تعداد نظرات', markers=True)
    st.plotly_chart(fig_line, use_container_width=True)
elif menu == "طبقه بندی اساتید":
    st.title("طبقه بندی اساتید")
    
    st.subheader("خوشه‌بندی اساتید بر اساس شباهت")
    
    c_df = run_clustering(df)
    fig_cluster = px.scatter(c_df, x='PCA1', y='PCA2', color='Persona', hover_name=c_df.index)
    st.plotly_chart(fig_cluster, use_container_width=True)

    st.subheader("تحلیل اهمیت ویژگی‌ها")
    X = df[['rating_2', 'rating_3', 'rating_4', 'rating_5', 'sent_num']]
    y = df['rating_1']
    rf = RandomForestRegressor(n_estimators=100).fit(X, y)
    feat_imp = pd.Series(rf.feature_importances_, index=['اخلاق', 'نمره‌دهی', 'سختی', 'وضوح', 'حس مثبت']).sort_values()
    st.bar_chart(feat_imp)
elif menu == "👤 پروفایل استاد":
    st.title("👤 تحلیل عملکرد استاد")
    
    prof_name = st.selectbox("نام استاد را انتخاب کنید:", sorted(df['professor_name_standard'].unique()))
    prof_df = df[df['professor_name_standard'] == prof_name]
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
            st.subheader("نمودار راداری امتیازات") 
            categories = ['تدریس', 'اخلاق', 'نمره دهی', 'سختی', 'وضوح', 'حمایت']
            values = prof_df[['rating_1', 'rating_2', 'rating_3', 'rating_4', 'rating_5', 'rating_6']].mean().values
            fig = go.Figure(data=go.Scatterpolar(r=values, theta=categories, fill='toself'))
            fig.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 10])))
            st.plotly_chart(fig)

    with col2:
        st.subheader("تحلیل حس نظرات (Sentiment)")
        
    
        sent_map = {'positive': 1, 'neutral': 0, 'negative': -1}
        prof_df['sent_numeric'] = prof_df['final_sentiment'].map(sent_map)
        avg_sent = prof_df['sent_numeric'].mean()
        
        st.metric("شاخص رضایت دانشجویان", f"{avg_sent:+.2f}", 
                  help="اعداد مثبت نشان‌دهنده رضایت و اعداد منفی نشان‌دهنده نارضایتی هستند.")

        st.subheader("کلمات پرتکرار در نظرات")
        text = " ".join(str(c) for c in prof_df['comments'] if pd.notna(c))
        fa_stopwords = set([
            'و', 'در', 'به', 'از', 'که', 'این', 'است', 'را', 'با', 'یک', 'برای', 
            'آن', 'شود', 'شده', 'بود', 'داشت', 'هم', 'تا', 'می', 'کند', 'کرد', 
            'دارد', 'همه', 'اما', 'اگر', 'دهد', 'خیلی', 'بودن', 'نیست', 'هست', 'کس'
        ])        
        if text.strip():
            reshaped_text = arabic_reshaper.reshape(text)
            bidi_text = get_display(reshaped_text)
         
            processed_stopwords = set([get_display(arabic_reshaper.reshape(sw)) for sw in fa_stopwords])

            try:
                wc = WordCloud(
                    font_path='Vazir.ttf', 
                    background_color="white", 
                    width=800,
                    height=450,
                    stopwords=processed_stopwords, 
                    collocations=False 
                ).generate(bidi_text)
                
                fig_wc, ax = plt.subplots(figsize=(10, 6))
                ax.imshow(wc, interpolation='bilinear')
                ax.axis("off")
                st.pyplot(fig_wc)
                
            except Exception as e:
                st.error(f"خطا در تولید ابر کلمات: {e}")

    st.divider()
    st.subheader("📊 توزیع احساسات بر اساس مدل هوش مصنوعی")
    sent_counts = prof_df['final_sentiment'].value_counts().reset_index()
    fig_sent = px.bar(
        sent_counts, x='final_sentiment', y='count', 
        color='final_sentiment',
        color_discrete_map={'positive':'green', 'neutral':'gray', 'negative':'red'},
        labels={'count': 'تعداد نظرات', 'final_sentiment': 'نوع حس'}
    )
    st.plotly_chart(fig_sent, use_container_width=True)
elif menu == "مقایسه اساتید":
        st.title("⚖️ مقایسه تخصصی اساتید")
        
        selected_profs = st.multiselect(
            "اساتید مورد نظر را انتخاب کنید (حداکثر ۳ مورد):", 
            options=sorted(df['professor_name_standard'].unique()), 
            max_selections=3
        )
        
        if selected_profs:
            compare_df = df[df['professor_name_standard'].isin(selected_profs)].groupby('professor_name_standard').agg({
                'rating_1': 'mean', 'rating_2': 'mean', 'rating_3': 'mean', 'rating_4': 'mean', 'sent_num': 'mean'
            }).reset_index()

            st.subheader("📊 مقایسه چندبعدی عملکرد")
            fig_radar = go.Figure()
            
            colors = ['#1f77b4', '#ff7f0e', '#2ca02c'] 

            categories = ['کیفیت تدریس', 'اخلاق', 'وضعیت نمره', 'سهولت امتحان', 'حس مثبت']
            
            for i, prof in enumerate(selected_profs):
                prof_data = compare_df[compare_df['professor_name_standard'] == prof]
                if not prof_data.empty:
                    values = [
                        prof_data['rating_1'].values[0],
                        prof_data['rating_2'].values[0],
                        prof_data['rating_3'].values[0],
                        prof_data['rating_4'].values[0],
                        prof_data['sent_num'].values[0] * 10 
                    ]
                    fig_radar.add_trace(go.Scatterpolar(
                        r=values,
                        theta=categories,
                        fill='toself',
                        name=prof,
                        line=dict(color=colors[i % len(colors)]) 
                    ))

            fig_radar.update_layout(
                polar=dict(radialaxis=dict(visible=True, range=[0, 10])),
                showlegend=True,
                title="تفاوت شاخص‌های اساتید در یک نگاه"
            )
            st.plotly_chart(fig_radar, use_container_width=True)
            

            st.subheader("⚖️ مقایسه مستقیم کیفیت تدریس و نمره‌دهی")
            
            plot_data = compare_df.melt(id_vars='professor_name_standard', 
                                       value_vars=['rating_1', 'rating_3'],
                                       var_name='Metric', value_name='Score')
            plot_data['Metric'] = plot_data['Metric'].map({'rating_1': 'کیفیت تدریس', 'rating_3': 'نمره دهی'})

            fig_bar = px.bar(
                plot_data, 
                x='Metric', 
                y='Score', 
                color='professor_name_standard',
                barmode='group',
                color_discrete_sequence=colors, 
                title="مقایسه دو به دو شاخص‌های اصلی"
            )
            st.plotly_chart(fig_bar, use_container_width=True)
            

            st.subheader("📋 جدول داده‌های خام")
            st.table(compare_df.rename(columns={
                'professor_name_standard': 'نام استاد',
                'rating_1': 'تدریس',
                'rating_3': 'نمره'
            })[['نام استاد', 'تدریس', 'نمره']])
            
        else:
            st.warning("⚠️ لطفاً اساتید را انتخاب کنید.")
elif menu == "📈 روندها و همبستگی":
    st.title("📈 تحلیل آماری پیشرفته")
    
    st.subheader("۱. نقشه همبستگی (Correlation Heatmap)")
    
    corr = df[['rating_1', 'rating_2', 'rating_3', 'rating_4', 'rating_5', 'rating_6']].corr()
    fig_heat = px.imshow(corr, text_auto=True, title="رابطه بین متغیرهای مختلف (مثلاً رابطه اخلاق و نمره)")
    st.plotly_chart(fig_heat, use_container_width=True)
    
    st.subheader("۲. تغییرات کیفیت در طول زمان")
    time_df = df.groupby('term')['rating_mean'].mean().reset_index()
    fig_time = px.line(time_df, x='term', y='rating_mean', title="میانگین نمرات در ترم‌های مختلف")
    st.plotly_chart(fig_time, use_container_width=True)

elif menu == "🏆 پیشنهاد دهنده":
    st.title("🏆 سیستم پیشنهاد دهنده هوشمند")
    course = st.selectbox("نام درس را انتخاب کنید:", sorted(df['course_name'].unique()))
    
    c_df = df[df['course_name'] == course].groupby('professor_name_standard').agg({
        'rating_mean': 'mean', 'sent_num': 'mean'
    })
    c_df['score'] = (c_df['rating_mean'] * 0.7) + (c_df['sent_num'] * 3)
    best = c_df.sort_values('score', ascending=False)
    st.dataframe(best[['score']].rename(columns={'score': 'امتیاز کل پیشنهادی'}))