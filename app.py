import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import arabic_reshaper
from bidi.algorithm import get_display
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# --- 1. PAGE CONFIGURATION ---
st.set_page_config(page_title="علموص یار - پیشرفته", layout="wide")

# RTL and Persian Font Styling
st.markdown("""
    <style>
    @import url('https://v1.fontapi.ir/css/Vazir');
    * { font-family: 'Vazir', sans-serif; text-align: right; }
    .main { direction: rtl; }
    [data-testid="stSidebar"] { direction: rtl; }
    .stMetric { text-align: center; }
    .stSlider { direction: ltr; } 
    </style>
    """, unsafe_allow_html=True)

# --- 2. DATA LOADING & ENHANCED PROCESSING ---
@st.cache_data
def load_and_standardize_data():
    try:
        df = pd.read_csv('extracted_reviews_v3_final.csv')
        
        # [Phase 2] Standardization [cite: 413]
        rating_cols = ['rating_1', 'rating_2', 'rating_3', 'rating_4', 'rating_5', 'rating_6']
        for col in rating_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(df[col].mean() if not df[col].empty else 0)
        
        # Clean Professor Names [cite: 414]
        df['professor_name_raw'] = df['professor_name_raw'].str.strip().str.replace('دکتر ', '')
        
        # [Phase 4.3.1] Simple Persian Sentiment Analysis [cite: 440]
        pos_words = ['خوب', 'عالی', 'مهربان', 'منصف', 'تسلط', 'بهترین', 'کمک']
        neg_words = ['بد', 'ضعیف', 'سختگیر', 'بی نظم', 'فشار', 'افتضاح', 'خسته']
        
        def get_sentiment(text):
            if pd.isna(text): return 0
            score = 0
            for w in pos_words: score += text.count(w)
            for w in neg_words: score -= text.count(w)
            return score / (len(text.split()) + 1)
            
        df['sentiment_score'] = df['comments'].apply(get_sentiment)
        return df
    except Exception as e:
        st.error(f"⚠️ خطا در بارگذاری داده: {e}")
        return pd.DataFrame()

df = load_and_standardize_data()

# --- 3. MACHINE LEARNING LOGIC ---

# [Phase 4.3.4] Unsupervised: Clustering with PCA [cite: 481]
def get_professor_clusters(data):
    # Grouping features by professor
    prof_data = data.groupby('professor_name_raw').agg({
        'rating_1': 'mean', 'rating_3': 'mean', 'sentiment_score': 'mean'
    })
    
    scaler = StandardScaler()
    scaled = scaler.fit_transform(prof_data)
    
    # KMeans
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    prof_data['Cluster'] = kmeans.fit_predict(scaled)
    
    # PCA for 2D visualization 
    pca = PCA(n_components=2)
    pca_res = pca.fit_transform(scaled)
    prof_data['PCA1'] = pca_res[:, 0]
    prof_data['PCA2'] = pca_res[:, 1]
    
    cluster_map = {0: "سخت‌گیر/جدی", 1: "محبوب/منصف", 2: "معمولی"}
    prof_data['Cluster_Label'] = prof_data['Cluster'].map(cluster_map)
    return prof_data

# [Phase 4.3.3] Supervised: Predicting Success Score [cite: 464]
def train_prediction_model(data):
    features = ['rating_2', 'rating_3', 'rating_4', 'rating_5', 'sentiment_score']
    X = data[features]
    y = data['rating_1'] # Target: Teaching Quality
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=50)
    model.fit(X_train, y_train)
    return model

# --- 4. NAVIGATION ---
st.sidebar.title("🔍 منوی علموص یار")
page = st.sidebar.radio("برو به", ["📊 نمای کلی", "👤 پروفایل استاد", "⚖️ مقایسه اساتید", "🤖 پیشنهاد دهنده", "🧠 تحلیل‌های پیشرفته (ML)"])

if not df.empty:
    # --- PAGE 1: OVERVIEW ---
    if page == "📊 نمای کلی":
        st.title("داشبورد تحلیلی اساتید علموص")
        col1, col2, col3 = st.columns(3)
        col1.metric("تعداد نظرات", len(df))
        col2.metric("تعداد اساتید", df['professor_name_raw'].nunique())
        col3.metric("میانگین رضایت", f"{df['rating_1'].mean():.2f}/10")

        fig_hist = px.histogram(df, x='rating_1', title="توزیع امتیاز تدریس", labels={'rating_1': 'امتیاز'})
        st.plotly_chart(fig_hist, use_container_width=True)

    # --- PAGE 2: PROFESSOR PROFILE ---
    elif page == "👤 پروفایل استاد":
        prof = st.selectbox("استاد را انتخاب کنید:", df['professor_name_raw'].unique())
        p_df = df[df['professor_name_raw'] == prof]
        
        st.header(f"پروفایل: {prof}")
        
        c1, c2 = st.columns(2)
        with c1:
            st.subheader("تحلیل ابعاد آموزشی")
            categories = ['تدریس', 'اخلاق', 'نمره دهی', 'سختی', 'وضوح', 'حمایت']
            values = p_df[['rating_1', 'rating_2', 'rating_3', 'rating_4', 'rating_5', 'rating_6']].mean().values
            fig_radar = go.Figure(data=go.Scatterpolar(r=values, theta=categories, fill='toself'))
            fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 10])))
            st.plotly_chart(fig_radar)
            
        with c2:
            st.subheader("وضعیت نمره‌دهی")
            # Custom pie chart for grading [cite: 536]
            grade_counts = p_df['grading'].value_counts()
            fig_pie = px.pie(values=grade_counts.values, names=grade_counts.index, hole=.3)
            st.plotly_chart(fig_pie)
    # --- PAGE 3: COMPARISON ---
    elif page == "⚖️ مقایسه اساتید":
        st.title("⚖️ بخش مقایسه اساتید")
        st.write("در این بخش می‌توانید عملکرد چند استاد را در کنار هم بررسی کنید.")

        # انتخاب اساتید برای مقایسه
        selected_profs = st.multiselect(
            "اساتید مورد نظر را انتخاب کنید (حداکثر ۳ مورد)", 
            options=sorted(df['professor_name_raw'].unique()), 
            max_selections=3
        )
        
        if selected_profs:
            # فیلتر کردن داده‌ها بر اساس اساتید انتخاب شده
            compare_df = df[df['professor_name_raw'].isin(selected_profs)]
            
            # محاسبه میانگین امتیازات برای هر استاد
            compare_stats = compare_df.groupby('professor_name_raw').agg({
                'rating_1': 'mean', # تدریس
                'rating_2': 'mean', # اخلاق
                'rating_3': 'mean', # نمره دهی
                'sentiment_score': 'mean' # حس نظرات
            }).reset_index()

            # ۱. نمودار ستونی مقایسه‌ای
            st.subheader("📊 مقایسه ویژگی‌های اصلی")
            
            # تبدیل داده برای رسم نمودار (Melt)
            plot_data = compare_stats.melt(id_vars='professor_name_raw', 
                                          value_vars=['rating_1', 'rating_2', 'rating_3'],
                                          var_name='ویژگی', value_name='امتیاز')
            
            # نگاشت نام‌های فارسی برای نمودار
            name_map = {'rating_1': 'کیفیت تدریس', 'rating_2': 'اخلاق', 'rating_3': 'نمره‌دهی'}
            plot_data['ویژگی'] = plot_data['ویژگی'].map(name_map)

            fig_comp = px.bar(
                plot_data, 
                x='ویژگی', 
                y='امتیاز', 
                color='professor_name_raw',
                barmode='group',
                text_auto='.1f',
                title="مقایسه تدریس، اخلاق و نمره‌دهی"
            )
            st.plotly_chart(fig_comp, use_container_width=True)

            # ۲. جدول داده‌های دقیق
            st.subheader("📋 جزئیات عددی")
            # تغییر نام ستون‌ها برای نمایش در جدول
            table_display = compare_stats.rename(columns={
                'professor_name_raw': 'نام استاد',
                'rating_1': 'تدریس',
                'rating_2': 'اخلاق',
                'rating_3': 'نمره‌دهی',
                'sentiment_score': 'شاخص حس'
            })
            st.dataframe(table_display.style.highlight_max(axis=0, color='lightgreen'))

        else:
            st.info("💡 لطفاً نام اساتید را از لیست بالا انتخاب کنید تا مقایسه انجام شود.")
    # --- PAGE 4: RECOMMENDER ---
    elif page == "🤖 پیشنهاد دهنده":
        st.title("سیستم پیشنهاد دهنده هوشمند")
        course = st.selectbox("نام درس:", sorted(df['course_name'].unique()))
        
        st.write("اولویت‌های شما:")
        w_teach = st.slider("اهمیت کیفیت تدریس", 0, 10, 5)
        w_grade = st.slider("اهمیت نمره‌دهی آسان", 0, 10, 5)
        w_sentiment = st.slider("اهمیت نظرات مثبت دانشجویان", 0, 10, 5)

        if st.button("🚀 پیشنهاد بده"):
            course_df = df[df['course_name'] == course].groupby('professor_name_raw').agg({
                'rating_1': 'mean', 'rating_3': 'mean', 'sentiment_score': 'mean'
            })
            
            # Weighted Calculation [cite: 508]
            course_df['score'] = (course_df['rating_1'] * w_teach) + \
                                 (course_df['rating_3'] * w_grade) + \
                                 (course_df['sentiment_score'] * 10 * w_sentiment)
            
            top_3 = course_df.sort_values('score', ascending=False).head(3)
            
            for name, row in top_3.iterrows():
                with st.expander(f"🏆 پیشنهاد: {name}"):
                    st.write(f"**دلیل پیشنهاد:** میانگین تدریس {row['rating_1']:.1f} و وضعیت نمره‌دهی مناسب.") # 
                    st.progress(min(row['score']/200, 1.0))

    # --- PAGE 5: ML ANALYSIS ---
    elif page == "🧠 تحلیل‌های پیشرفته (ML)":
        st.title("تحلیل داده‌کاوی")
        
        # Clustering Plot [cite: 492]
        st.subheader("خوشه‌بندی اساتید (KMeans + PCA)")
        cluster_df = get_professor_clusters(df)
        fig_pca = px.scatter(cluster_df, x='PCA1', y='PCA2', color='Cluster_Label', 
                             hover_name=cluster_df.index, title="نمودار پراکندگی اساتید بر اساس شباهت")
        st.plotly_chart(fig_pca, use_container_width=True)
        
        # Feature Importance [cite: 480]
        st.subheader("چه عواملی بر رضایت از تدریس اثر دارند؟")
        model = train_prediction_model(df)
        feat_imp = pd.Series(model.feature_importances_, index=['اخلاق', 'نمره', 'سختی', 'وضوح', 'حس مثبت']).sort_values()
        st.bar_chart(feat_imp)