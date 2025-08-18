import http from '@/utils/http'

export default {
  /**
   * request for PDF preview URL
   */
  getPdfUrl(params: { fileName: string }): Promise<string> {
    return http.get('/smart/report/upload/preview', { params })
  }
}
