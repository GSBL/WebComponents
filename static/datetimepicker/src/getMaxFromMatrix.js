function getMaxFromMatrix(arr, n) {

	var max = 0, // 存放最大值
		type = 0, // 表示三个数的组合类型，0表示竖，1表示横，2表示斜
		sum = [0, 0, 0], // 存放各种组合类型的和
		p = 0, // 保存最大值组合中的一个数的横下标
		q = 0, // 保存最大值组合中的一个数的纵下标
		i = 0,
		j = 0;

	for (; i < n; i++) {
		for (j = 0; j < n; j++) {
			// 竖
			if (i < n - 2) {
				sum[0] = arr[i][j] + arr[i + 1][j] + arr[i + 2][j];
			}
			// 横
			if (j < n - 2) {
				sum[1] = arr[i][j] + arr[i][j + 1] + arr[i][j + 2];
			}
			// 斜
			if ((i < n - 2) && (j < n - 2)) {
				sum[2] = arr[i][j] + arr[i + 1][j + 1] + arr[i + 2][j + 2];
			}
			if (max < sum[0]) {
				type = 0;
				max = sum[0];
				p = i;
				q = j;
			}
			if (max < sum[1]) {
				type = 1;
				max = sum[1];
				p = i;
				q = j;
			}
			if (max < sum[2]) {
				type = 2;
				max = sum[2];
				p = i;
				q = j;
			}
		}
	}

	switch (type) {
		case 0:
			return "最大值：" + max + ",由" + arr[p][q] + "+" + arr[p + 1][q] + "+" + arr[p + 2][q];
			break;
		case 1:
			return "最大值：" + max + ",由" + arr[p][q] + "+" + arr[p][q + 1] + "+" + arr[p][q + 2];
			break;
		case 2:
			return "最大值：" + max + ",由" + arr[p][q] + "+" + arr[p + 1][q + 1] + "+" + arr[p + 2][q + 2];
			break;
	}

}
// 测试
console.log(getMaxFromMatrix([
	[1, 2, 3, 33],
	[4, 5, 6, 44],
	[7, 8, 9, 32],
	[7, 8, 9, 54]
], 4));
/**
 * 暂未想到优化算法
 */