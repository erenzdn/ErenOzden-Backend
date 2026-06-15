#!/bin/bash

# ============================================
# STRAPI PRODUCTION DEPLOY SCRIPT
# Mehmet Eren Özden - mehmeterenozden.com
# ============================================
#
# Kullanım: ./scripts/deploy.sh [options]
# Options:
#   --full      : Tam deploy (clean + build + restart)
#   --quick     : Hızlı deploy (sadece restart)
#   --build     : Sadece build
#   --restart   : Sadece pm2 restart
#
# ============================================

set -e

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Proje dizini (bu scriptin bulunduğu dizinin bir üstü)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# PM2 uygulama adı
PM2_APP_NAME="strapi-backend"

# Fonksiyonlar
print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_requirements() {
    print_header "Gereksinimler Kontrol Ediliyor..."
    
    # Node.js kontrolü
    if ! command -v node &> /dev/null; then
        print_error "Node.js bulunamadı!"
        exit 1
    fi
    print_success "Node.js: $(node -v)"
    
    # npm kontrolü
    if ! command -v npm &> /dev/null; then
        print_error "npm bulunamadı!"
        exit 1
    fi
    print_success "npm: $(npm -v)"
    
    # PM2 kontrolü
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 bulunamadı. Kuruluyor..."
        npm install -g pm2
    fi
    print_success "PM2: $(pm2 -v)"
    
    # .env dosyası kontrolü
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        print_error ".env dosyası bulunamadı!"
        print_warning ".env.example dosyasını .env olarak kopyalayıp düzenleyin."
        exit 1
    fi
    print_success ".env dosyası mevcut"
}

clean_build() {
    print_header "Temizlik Yapılıyor..."
    
    cd "$PROJECT_DIR"
    
    # Build klasörünü temizle
    if [ -d "dist" ]; then
        rm -rf dist
        print_success "dist/ klasörü silindi"
    fi
    
    # .cache klasörünü temizle
    if [ -d ".cache" ]; then
        rm -rf .cache
        print_success ".cache/ klasörü silindi"
    fi
    
    # Build cache temizle
    if [ -d "build" ]; then
        rm -rf build
        print_success "build/ klasörü silindi"
    fi
    
    print_success "Temizlik tamamlandı"
}

install_dependencies() {
    print_header "Bağımlılıklar Kuruluyor..."
    
    cd "$PROJECT_DIR"
    
    # Production bağımlılıklarını kur
    npm ci --production=false
    
    print_success "Bağımlılıklar kuruldu"
}

build_strapi() {
    print_header "Strapi Build Ediliyor..."
    
    cd "$PROJECT_DIR"
    
    # Production ortamında build
    NODE_ENV=production npm run build
    
    print_success "Build tamamlandı"
}

restart_pm2() {
    print_header "PM2 Yeniden Başlatılıyor..."
    
    cd "$PROJECT_DIR"
    
    # PM2 durumunu kontrol et
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        # Uygulama zaten çalışıyor, restart yap
        pm2 restart "$PM2_APP_NAME"
        print_success "PM2 yeniden başlatıldı"
    else
        # Uygulama çalışmıyor, başlat
        pm2 start ecosystem.config.js --env production
        print_success "PM2 başlatıldı"
    fi
    
    # PM2 durumunu kaydet (sunucu yeniden başlatıldığında otomatik başlasın)
    pm2 save
    
    print_success "PM2 yapılandırması kaydedildi"
}

show_status() {
    print_header "Sistem Durumu"
    
    pm2 status
    
    echo -e "\n${BLUE}Log'ları görmek için:${NC}"
    echo "  pm2 logs $PM2_APP_NAME"
    
    echo -e "\n${BLUE}Uygulamayı durdurmak için:${NC}"
    echo "  pm2 stop $PM2_APP_NAME"
}

full_deploy() {
    check_requirements
    clean_build
    install_dependencies
    build_strapi
    restart_pm2
    show_status
    
    print_header "Deploy Tamamlandı!"
    echo -e "${GREEN}API: https://api.mehmeterenozden.com${NC}"
    echo -e "${GREEN}Admin: https://yonetimpaneli.mehmeterenozden.com/admin${NC}"
}

quick_deploy() {
    check_requirements
    restart_pm2
    show_status
}

# Ana script
case "$1" in
    --full)
        full_deploy
        ;;
    --quick)
        quick_deploy
        ;;
    --build)
        check_requirements
        build_strapi
        ;;
    --restart)
        restart_pm2
        show_status
        ;;
    --clean)
        clean_build
        ;;
    *)
        echo "Kullanım: $0 [--full|--quick|--build|--restart|--clean]"
        echo ""
        echo "Seçenekler:"
        echo "  --full      Tam deploy (clean + build + restart)"
        echo "  --quick     Hızlı deploy (sadece restart)"
        echo "  --build     Sadece build"
        echo "  --restart   Sadece PM2 restart"
        echo "  --clean     Sadece temizlik"
        exit 1
        ;;
esac
